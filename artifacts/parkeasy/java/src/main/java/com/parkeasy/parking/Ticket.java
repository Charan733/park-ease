package com.parkeasy.parking;

import java.time.Instant;

/** The record created at entry and completed when payment succeeds. */
public final class Ticket {
    private final String id;
    private final Vehicle vehicle;
    private final ParkingSlot slot;
    private final Instant entryTime;
    private Instant exitTime;
    private double fee;
    private String paymentMethod;

    Ticket(String id, Vehicle vehicle, ParkingSlot slot, Instant entryTime) {
        this.id = id;
        this.vehicle = vehicle;
        this.slot = slot;
        this.entryTime = entryTime;
    }

    synchronized void complete(Instant exitTime, double fee, String paymentMethod) {
        if (this.exitTime != null) {
            throw new IllegalStateException("Ticket " + id + " is already complete.");
        }
        this.exitTime = exitTime;
        this.fee = fee;
        this.paymentMethod = paymentMethod;
    }

    public String getId() {
        return id;
    }

    public Vehicle getVehicle() {
        return vehicle;
    }

    public ParkingSlot getSlot() {
        return slot;
    }

    public Instant getEntryTime() {
        return entryTime;
    }

    public synchronized Instant getExitTime() {
        return exitTime;
    }

    public synchronized double getFee() {
        return fee;
    }

    public synchronized String getPaymentMethod() {
        return paymentMethod;
    }

    public synchronized boolean isComplete() {
        return exitTime != null;
    }
}
