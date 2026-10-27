export type PaymentMethod = 'Card' | 'UPI' | 'Cash';

export interface PaymentStrategy {
  readonly method: PaymentMethod;
  pay(amount: number): { success: true; message: string };
}

abstract class DemoPayment implements PaymentStrategy {
  abstract readonly method: PaymentMethod;

  pay(amount: number): { success: true; message: string } {
    if (!Number.isFinite(amount) || amount < 0) throw new Error('Payment amount is invalid.');
    return { success: true, message: `${this.method} payment of Rs ${amount.toFixed(2)} recorded (demo).` };
  }
}

export class CardPayment extends DemoPayment { readonly method = 'Card' as const; }
export class UpiPayment extends DemoPayment { readonly method = 'UPI' as const; }
export class CashPayment extends DemoPayment { readonly method = 'Cash' as const; }

export function createPaymentStrategy(method: PaymentMethod): PaymentStrategy {
  switch (method) {
    case 'Card': return new CardPayment();
    case 'UPI': return new UpiPayment();
    case 'Cash': return new CashPayment();
    default: throw new Error('Choose a valid payment method.');
  }
}
