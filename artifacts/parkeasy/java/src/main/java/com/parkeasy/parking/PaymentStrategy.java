package com.parkeasy.parking;

/** A replaceable way to complete a simulated payment. */
public interface PaymentStrategy {
    boolean pay(double amount);

    String getName();
}
