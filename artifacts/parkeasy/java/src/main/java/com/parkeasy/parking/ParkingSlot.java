package com.parkeasy.parking;

/** A numbered space in the lot. */
public final class ParkingSlot {
    private final int id;
    private final SlotType type;
    private boolean occupied;

    public ParkingSlot(int id, SlotType type) {
        this.id = id;
        this.type = type;
        this.occupied = false;
    }

    public int getId() {
        return id;
    }

    public SlotType getType() {
        return type;
    }

    public synchronized boolean isOccupied() {
        return occupied;
    }

    synchronized void occupy() {
        if (occupied) {
            throw new IllegalStateException("Slot " + id + " is already occupied.");
        }
        occupied = true;
    }

    synchronized void vacate() {
        if (!occupied) {
            throw new IllegalStateException("Slot " + id + " is already free.");
        }
        occupied = false;
    }

    @Override
    public String toString() {
        return "Slot " + id + " (" + type + ") — " + (occupied ? "OCCUPIED" : "FREE");
    }
}
