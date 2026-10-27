import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ArrowRight, Bike, CarFront, Check, CircleParking, Clock3, LogOut, Truck } from 'lucide-react';
import { ParkingLot, type ParkingLotSnapshot, type ParkingSlot, type Ticket } from './domain/ParkingLot';
import { VehicleFactory, type VehicleType } from './domain/VehicleFactory';
import { FlatFee, HourlyFee } from './domain/FeeStrategy';
import type { PaymentMethod } from './domain/PaymentStrategy';

const queryClient = new QueryClient();
const lot = ParkingLot.getInstance();

function formatDate(value?: string) {
  return value
    ? new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }).format(new Date(value))
    : '—';
}

function Home() {
  const [snapshot, setSnapshot] = useState<ParkingLotSnapshot>(() => lot.getSnapshot());
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('Car');
  const [parkMessage, setParkMessage] = useState<{ type: 'success' | 'error'; text: string; ticket?: Ticket } | null>(null);
  const [ticketId, setTicketId] = useState('');
  const [feeType, setFeeType] = useState<'Hourly' | 'Flat'>('Hourly');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Card');
  const [exitMessage, setExitMessage] = useState<{ type: 'success' | 'error'; text: string; ticket?: Ticket } | null>(null);

  const occupied = snapshot.slots.filter((slot) => slot.occupied).length;
  const available = snapshot.slots.length - occupied;
  const occupancy = snapshot.slots.length ? Math.round((occupied / snapshot.slots.length) * 100) : 0;
  const activeTickets = useMemo(() => snapshot.activeTickets, [snapshot.activeTickets]);

  function refresh() { setSnapshot(lot.getSnapshot()); }

  function handlePark(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setParkMessage(null);
    try {
      const vehicle = VehicleFactory.create(vehicleNumber, vehicleType);
      const ticket = lot.park(vehicle);
      refresh();
      setVehicleNumber('');
      setParkMessage({ type: 'success', text: `Vehicle parked in ${ticket.slotId}. Ticket ${ticket.id} is ready.`, ticket });
    } catch (error) {
      setParkMessage({ type: 'error', text: error instanceof Error ? error.message : 'Could not park this vehicle.' });
    }
  }

  function handleExit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setExitMessage(null);
    try {
      const strategy = feeType === 'Hourly' ? new HourlyFee() : new FlatFee();
      const completed = lot.completeExit(ticketId, strategy, paymentMethod);
      refresh();
      setTicketId('');
      setExitMessage({
        type: 'success',
        text: `${paymentMethod} payment recorded. ${completed.slotId} is now available.`,
        ticket: completed,
      });
    } catch (error) {
      setExitMessage({ type: 'error', text: error instanceof Error ? error.message : 'Could not complete this exit.' });
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand" data-testid="text-brand">
          <span className="brand-mark"><CircleParking aria-hidden="true" /></span>
          ParkEasy
        </div>
        <div className="topbar-meta"><span className="live-dot" /> Lot A <span aria-hidden="true">·</span> Operator view</div>
      </header>

      <main className="page">
        <section className="intro">
          <div>
            <div className="eyebrow">Parking operations / overview</div>
            <h1>A clear view of<br />what’s parked.</h1>
            <p>Park arrivals, process departures, and watch the lot update as you work. This small demo keeps everything in memory.</p>
          </div>
          <div className="demo-chip">ILLUSTRATIVE DEMO DATA</div>
        </section>

        <section className="summary-grid" aria-label="Parking lot summary">
          <Summary label="Available spaces" value={available} detail={`of ${snapshot.slots.length} total`} />
          <Summary label="Currently occupied" value={occupied} detail={`${occupancy}% lot capacity`} />
          <Summary label="Active tickets" value={snapshot.activeTickets.length} detail="vehicles in the lot" />
        </section>

        <section className="main-grid">
          <section className="panel lot-panel" aria-labelledby="lot-heading">
            <div className="panel-head">
              <div>
                <h2 className="panel-title" id="lot-heading">Lot A · live layout</h2>
                <p className="panel-subtitle">Each space accepts one exact vehicle size.</p>
              </div>
              <div className="legend" aria-label="Slot legend">
                <span><i className="legend-dot" /> Available</span>
                <span><i className="legend-dot occupied" /> Occupied</span>
              </div>
            </div>
            <div className="lot-grid" role="list" aria-label="Parking spaces">
              {snapshot.slots.map((slot) => <Slot key={slot.id} slot={slot} />)}
            </div>
            <div className="lot-foot">
              <span>Nearest match is the lowest-numbered free space.</span>
              <strong>{occupied} / {snapshot.slots.length} IN USE</strong>
            </div>
          </section>

          <div className="operations">
            <section className="panel form-panel">
              <div className="form-title-row">
                <span className="form-icon"><CarFront aria-hidden="true" /></span>
                <div><h2 className="form-title">Park a vehicle</h2><p className="form-note">Create a ticket and assign a space.</p></div>
              </div>
              <form onSubmit={handlePark}>
                <label className="field-label" htmlFor="vehicle-number">Vehicle number</label>
                <input
                  id="vehicle-number" data-testid="input-vehicle-number" className="field"
                  placeholder="e.g. AB-1234" maxLength={12} value={vehicleNumber}
                  onChange={(event) => setVehicleNumber(event.target.value)}
                  aria-describedby="vehicle-hint" required
                />
                <div className="form-row">
                  <div>
                    <label className="field-label" htmlFor="vehicle-type">Vehicle type</label>
                    <select id="vehicle-type" data-testid="select-vehicle-type" className="field" value={vehicleType} onChange={(event) => setVehicleType(event.target.value as VehicleType)}>
                      <option value="Bike">Bike · Small</option>
                      <option value="Car">Car · Medium</option>
                      <option value="Truck">Truck · Large</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label" htmlFor="matches">Matching spaces</label>
                    <div id="matches" className="field" style={{ color: '#536860', background: '#f4f3ec' }} aria-live="polite">
                      {snapshot.slots.filter((slot) => slot.type === ({ Bike: 'Small', Car: 'Medium', Truck: 'Large' } as const)[vehicleType] && !slot.occupied).length} available
                    </div>
                  </div>
                </div>
                <p id="vehicle-hint" className="price-hint">Use letters, numbers, and hyphens. Same-size spaces only.</p>
                <button className="primary-button" data-testid="button-park" type="submit">Park vehicle <ArrowRight aria-hidden="true" /></button>
              </form>
              {parkMessage && (
                <div className={`feedback ${parkMessage.type}`} role={parkMessage.type === 'error' ? 'alert' : 'status'} data-testid="status-park-result">
                  {parkMessage.text}
                  {parkMessage.ticket && <TicketReceipt ticket={parkMessage.ticket} />}
                </div>
              )}
            </section>

            <section className="panel form-panel">
              <div className="form-title-row">
                <span className="form-icon exit-icon"><LogOut aria-hidden="true" /></span>
                <div><h2 className="form-title">Process an exit</h2><p className="form-note">Calculate a fee and release the space.</p></div>
              </div>
              <form onSubmit={handleExit}>
                <label className="field-label" htmlFor="ticket-id">Active ticket ID</label>
                <input
                  id="ticket-id" data-testid="input-ticket-id" list="active-ticket-list" className="field"
                  placeholder="e.g. PK-102" value={ticketId} onChange={(event) => setTicketId(event.target.value)} required
                />
                <datalist id="active-ticket-list">
                  {activeTickets.map((ticket) => <option key={ticket.id} value={ticket.id}>{ticket.vehicle.number} · {ticket.slotId}</option>)}
                </datalist>
                <div className="form-row">
                  <div>
                    <label className="field-label" htmlFor="fee-type">Fee strategy</label>
                    <select id="fee-type" data-testid="select-fee-type" className="field" value={feeType} onChange={(event) => setFeeType(event.target.value as 'Hourly' | 'Flat')}>
                      <option value="Hourly">Hourly · Rs 50 / started hour</option>
                      <option value="Flat">Flat · Rs 120</option>
                    </select>
                  </div>
                  <div>
                    <label className="field-label" htmlFor="payment-method">Payment</label>
                    <select id="payment-method" data-testid="select-payment-method" className="field" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentMethod)}>
                      <option value="Card">Card</option>
                      <option value="UPI">UPI</option>
                      <option value="Cash">Cash</option>
                    </select>
                  </div>
                </div>
                <p className="price-hint">Hourly time rounds up to a full hour; minimum charge is one hour.</p>
                <button className="primary-button" data-testid="button-process-exit" type="submit">Calculate &amp; release <ArrowRight aria-hidden="true" /></button>
              </form>
              {exitMessage && (
                <div className={`feedback ${exitMessage.type}`} role={exitMessage.type === 'error' ? 'alert' : 'status'} data-testid="status-exit-result">
                  {exitMessage.ticket && <><strong style={{ display: 'block', marginBottom: 4 }}><Check size={14} style={{ verticalAlign: 'middle' }} /> Payment successful · Rs {exitMessage.ticket.fee?.toFixed(2)}</strong></>}
                  {exitMessage.text}
                  {exitMessage.ticket && <TicketReceipt ticket={exitMessage.ticket} />}
                </div>
              )}
            </section>
          </div>
        </section>

        <div className="content-stack">
          <section className="panel history-panel" aria-labelledby="history-heading">
            <div className="section-top">
              <div><h2 id="history-heading">Completed tickets</h2><p>Recent departures and recorded payments.</p></div>
              <span className="history-count">{snapshot.completedHistory.length} RECORDS</span>
            </div>
            {snapshot.completedHistory.length === 0 ? (
              <div className="feedback" data-testid="empty-history">No completed tickets yet. Process an exit to start the history.</div>
            ) : (
              <div className="table-wrap">
                <table className="history-table">
                  <thead><tr><th>Ticket / vehicle</th><th>Space</th><th>Entry</th><th>Exit</th><th>Strategy</th><th>Paid</th><th>Method</th></tr></thead>
                  <tbody>
                    {snapshot.completedHistory.map((ticket) => (
                      <tr key={ticket.id} data-testid={`row-ticket-${ticket.id}`}>
                        <td><span className="mono">{ticket.id}</span><br /><span className="vehicle-pill">{ticket.vehicle.number}</span></td>
                        <td className="mono">{ticket.slotId}</td>
                        <td>{formatDate(ticket.entryTime)}</td>
                        <td>{formatDate(ticket.exitTime)}</td>
                        <td>{ticket.feeStrategy}</td>
                        <td className="paid">Rs {ticket.fee?.toFixed(2)}</td>
                        <td>{ticket.paymentMethod}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="panel patterns" aria-labelledby="patterns-heading">
            <div className="pattern-copy">
              <div className="eyebrow">Under the hood</div>
              <h2 id="patterns-heading">Three patterns, one lot.</h2>
              <p>The domain objects own decisions and state changes. The screen simply collects choices and reflects the resulting snapshot.</p>
              <div className="pattern-list">
                <Pattern number="01" title="Singleton · one shared lot" description="ParkingLot.getInstance() keeps a single in-memory set of spaces, active tickets, and history." />
                <Pattern number="02" title="Factory · the right vehicle" description="VehicleFactory creates a typed vehicle and maps Bike, Car, or Truck to its exact slot size." />
                <Pattern number="03" title="Strategy · swap the behavior" description="Fee and payment strategies vary the calculation or demo payment without changing the exit workflow." />
              </div>
            </div>
            <div className="diagram" aria-label="Text class diagram">
              <div className="diagram-head"><span>CLASS MAP</span><span>PLAIN TEXT</span></div>
              <div className="diagram-body">
                <pre>{`┌─────────────────────┐
│     ParkingLot      │◆── ParkingSlot[]
├─────────────────────┤◆── Ticket[]
│ +getInstance()      │
│ +park(vehicle)      │
│ +completeExit(...)  │
│ +getSnapshot()      │
└──────────┬──────────┘
           │ uses
   ┌───────┴─────────┐
   │                 │
┌──▼────────────┐  ┌─▼───────────────┐
│VehicleFactory │  │  FeeStrategy    │
├───────────────┤  ├─────────────────┤
│ +create(...)  │  │ +calculate(...) │
└──┬────────────┘  └──┬───────────┬──┘
   │ creates           │           │
 Bike · Car · Truck  HourlyFee   FlatFee
                       └─────┬─────┘
                             │
                    PaymentStrategy
                    Card · UPI · Cash

// ◆ owns state   ··· implements strategy`}</pre>
              </div>
            </div>
          </section>
        </div>
        <footer className="footer">PARKEASY / MEMORY-ONLY EDUCATIONAL DEMO</footer>
      </main>
    </div>
  );
}

function Summary({ label, value, detail }: { label: string; value: number; detail: string }) {
  return <div className="summary-card" data-testid={`summary-${label.toLowerCase().replaceAll(' ', '-')}`}>
    <div><div className="summary-label">{label}</div><div className="summary-value">{value}</div></div>
    <div className="summary-side">{detail}</div>
  </div>;
}

function Slot({ slot }: { slot: ParkingSlot }) {
  const Icon = slot.type === 'Small' ? Bike : slot.type === 'Large' ? Truck : CarFront;
  return <div className={`slot${slot.occupied ? ' occupied' : ''}`} role="listitem" data-testid={`slot-${slot.id}`} aria-label={`${slot.id}, ${slot.type}, ${slot.occupied ? `occupied by ${slot.vehicleNumber}` : 'available'}`}>
    <div className="slot-top">
      <span className="slot-id">{slot.id}</span>
      <Icon size={15} aria-hidden="true" />
    </div>
    <div className="slot-top"><span className="slot-type">{slot.type}</span><span className="slot-vehicle">{slot.occupied ? slot.vehicleNumber : 'OPEN'}</span></div>
  </div>;
}

function TicketReceipt({ ticket }: { ticket: Ticket }) {
  return <div className="ticket-result" data-testid={`receipt-${ticket.id}`}>
    <div>Ticket <strong>{ticket.id}</strong> · space <strong>{ticket.slotId}</strong></div>
    <div>{ticket.vehicle.number} · {ticket.vehicle.type} · {ticket.vehicle.requiredSlotType}</div>
    <div><Clock3 size={12} style={{ verticalAlign: 'middle' }} /> Entry {formatDate(ticket.entryTime)}</div>
    {ticket.exitTime && <div>Exit {formatDate(ticket.exitTime)} · {ticket.paymentMethod} · <strong>Rs {ticket.fee?.toFixed(2)}</strong></div>}
  </div>;
}

function Pattern({ number, title, description }: { number: string; title: string; description: string }) {
  return <div className="pattern-item"><span className="pattern-num">{number}</span><div><strong>{title}</strong><p>{description}</p></div></div>;
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
