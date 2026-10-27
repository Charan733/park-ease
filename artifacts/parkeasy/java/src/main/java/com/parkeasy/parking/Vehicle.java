package com.parkeasy.parking;

/** Shared data and behavior for every vehicle supported by the lot. */
public abstract class Vehicle {
    private final String number;

    protected Vehicle(String number) {
        if (number == null || number.isBlank()) {
            throw new IllegalArgumentException("Vehicle number cannot be blank.");
        }
        this.number = number.trim().toUpperCase();
    }

    public String getNumber() {
        return number;
    }

    public abstract String getTypeName();

    public abstract SlotType getRequiredSlotType();

    @Override
    public String toString() {
        return getTypeName() + " " + number;
    }
}
