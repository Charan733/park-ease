package com.parkeasy.parking;

public final class UpiPayment implements PaymentStrategy {
    @Override
    public boolean pay(double amount) {
        System.out.printf("UPI payment successful: Rs %.2f%n", amount);
        return true;
    }

    @Override
    public String getName() {
        return "UPI";
    }
}
