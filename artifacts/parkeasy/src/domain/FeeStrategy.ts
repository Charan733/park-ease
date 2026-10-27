import type { Ticket } from './ParkingLot';

export interface FeeStrategy {
  readonly name: 'Hourly' | 'Flat';
  calculate(ticket: Ticket, exitTime: Date): number;
}

/** Demo pricing: Rs 50 per started hour, with a one-hour minimum. */
export class HourlyFee implements FeeStrategy {
  readonly name = 'Hourly' as const;
  static readonly hourlyRate = 50;

  calculate(ticket: Ticket, exitTime: Date): number {
    const elapsed = Math.max(0, exitTime.getTime() - new Date(ticket.entryTime).getTime());
    const hours = Math.max(1, Math.ceil(elapsed / 3_600_000));
    return Number((hours * HourlyFee.hourlyRate).toFixed(2));
  }
}

/** Demo pricing: one fixed Rs 120 charge per completed visit. */
export class FlatFee implements FeeStrategy {
  readonly name = 'Flat' as const;
  static readonly flatRate = 120;

  calculate(_ticket: Ticket, _exitTime: Date): number {
    return FlatFee.flatRate;
  }
}
