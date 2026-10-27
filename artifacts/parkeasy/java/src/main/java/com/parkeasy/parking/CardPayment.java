package com.parkeasy.parking;

public final class CardPayment implements PaymentStrategy {
    @Override
    public boolean pay(double amount) {
        System.out.printf("Card payment successful: Rs %.2f%n", amount);
        return true;
    }

    @Override
    public String getName() {
        return "Card";
    }
}
