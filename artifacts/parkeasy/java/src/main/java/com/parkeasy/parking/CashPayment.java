package com.parkeasy.parking;

public final class CashPayment implements PaymentStrategy {
    @Override
    public boolean pay(double amount) {
        System.out.printf("Cash payment received: Rs %.2f%n", amount);
        return true;
    }

    @Override
    public String getName() {
        return "Cash";
    }
}
