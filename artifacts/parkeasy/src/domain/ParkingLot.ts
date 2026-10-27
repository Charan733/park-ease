import type { Vehicle, SlotType } from './VehicleFactory';
import type { FeeStrategy } from './FeeStrategy';
import { createPaymentStrategy, type PaymentMethod } from './PaymentStrategy';

export interface ParkingSlot {
  id: string;
  type: SlotType;
  occupied: boolean;
  vehicleNumber?: string;
}

export interface Ticket {
  id: string;
  vehicle: Vehicle;
  slotId: string;
  entryTime: string;
  exitTime?: string;
  fee?: number;
  feeStrategy?: 'Hourly' | 'Flat';
  paymentMethod?: PaymentMethod;
}

export interface ParkingLotSnapshot {
  slots: ParkingSlot[];
  activeTickets: Ticket[];
  completedHistory: Ticket[];
}

export class ParkingLot {
  private static instance: ParkingLot | undefined;
  private slots: ParkingSlot[];
  private activeTickets: Ticket[];
  private completedHistory: Ticket[];
  private serial = 104;

  private constructor() {
    const types: SlotType[] = ['Small', 'Medium', 'Large', 'Small', 'Medium', 'Large', 'Small', 'Medium', 'Large', 'Small', 'Medium', 'Large'];
    this.slots = types.map((type, index) => ({ id: `P-${String(index + 1).padStart(2, '0')}`, type, occupied: false }));
    const now = Date.now();
    this.activeTickets = [
      { id: 'PK-102', vehicle: { number: 'KJ-4821', type: 'Car', requiredSlotType: 'Medium' }, slotId: 'P-02', entryTime: new Date(now - 7_800_000).toISOString() },
      { id: 'PK-103', vehicle: { number: 'MOTO-17', type: 'Bike', requiredSlotType: 'Small' }, slotId: 'P-01', entryTime: new Date(now - 3_300_000).toISOString() },
    ];
    this.activeTickets.forEach((ticket) => {
      const slot = this.slots.find((item) => item.id === ticket.slotId);
      if (slot) { slot.occupied = true; slot.vehicleNumber = ticket.vehicle.number; }
    });
    this.completedHistory = [
      { id: 'PK-101', vehicle: { number: 'HBR-208', type: 'Car', requiredSlotType: 'Medium' }, slotId: 'P-05', entryTime: new Date(now - 28_800_000).toISOString(), exitTime: new Date(now - 25_200_000).toISOString(), fee: 50, feeStrategy: 'Hourly', paymentMethod: 'Card' },
      { id: 'PK-100', vehicle: { number: 'BIKE-6', type: 'Bike', requiredSlotType: 'Small' }, slotId: 'P-04', entryTime: new Date(now - 57_600_000).toISOString(), exitTime: new Date(now - 54_000_000).toISOString(), fee: 120, feeStrategy: 'Flat', paymentMethod: 'Cash' },
    ];
  }

  static getInstance(): ParkingLot {
    if (!ParkingLot.instance) ParkingLot.instance = new ParkingLot();
    return ParkingLot.instance;
  }

  getSnapshot(): ParkingLotSnapshot {
    return {
      slots: this.slots.map((slot) => ({ ...slot })),
      activeTickets: this.activeTickets.map((ticket) => ({ ...ticket, vehicle: { ...ticket.vehicle } })),
      completedHistory: this.completedHistory.map((ticket) => ({ ...ticket, vehicle: { ...ticket.vehicle } })),
    };
  }

  park(vehicle: Vehicle): Ticket {
    if (this.activeTickets.some((ticket) => ticket.vehicle.number === vehicle.number)) {
      throw new Error(`${vehicle.number} already has an active ticket.`);
    }
    const matching = this.slots.filter((slot) => slot.type === vehicle.requiredSlotType);
    if (matching.length === 0) throw new Error(`No ${vehicle.requiredSlotType.toLowerCase()} slots are configured for this vehicle.`);
    const slot = matching.filter((item) => !item.occupied).sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))[0];
    if (!slot) throw new Error(`The lot is full for ${vehicle.type.toLowerCase()}s. No ${vehicle.requiredSlotType.toLowerCase()} slots are available.`);
    const ticket: Ticket = { id: `PK-${++this.serial}`, vehicle: { ...vehicle }, slotId: slot.id, entryTime: new Date().toISOString() };
    slot.occupied = true;
    slot.vehicleNumber = vehicle.number;
    this.activeTickets.push(ticket);
    return { ...ticket, vehicle: { ...ticket.vehicle } };
  }

  completeExit(ticketId: string, feeStrategy: FeeStrategy, paymentMethod: PaymentMethod): Ticket {
    const ticketIndex = this.activeTickets.findIndex((ticket) => ticket.id.toUpperCase() === ticketId.trim().toUpperCase());
    if (!ticketId.trim()) throw new Error('Enter an active ticket ID.');
    if (ticketIndex < 0) throw new Error(`Ticket ${ticketId.trim()} is not active. Check the ID and try again.`);
    const ticket = this.activeTickets[ticketIndex];
    const exitTime = new Date();
    const fee = feeStrategy.calculate(ticket, exitTime);
    createPaymentStrategy(paymentMethod).pay(fee);
    const completed: Ticket = { ...ticket, vehicle: { ...ticket.vehicle }, exitTime: exitTime.toISOString(), fee, feeStrategy: feeStrategy.name, paymentMethod };
    this.activeTickets.splice(ticketIndex, 1);
    const slot = this.slots.find((item) => item.id === ticket.slotId);
    if (slot) { slot.occupied = false; delete slot.vehicleNumber; }
    this.completedHistory.unshift(completed);
    return { ...completed, vehicle: { ...completed.vehicle } };
  }
}
