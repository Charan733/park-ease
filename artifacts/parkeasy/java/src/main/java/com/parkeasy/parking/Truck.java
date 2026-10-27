package com.parkeasy.parking;

public final class Truck extends Vehicle {
    public Truck(String number) {
        super(number);
    }

    @Override
    public String getTypeName() {
        return "Truck";
    }

    @Override
    public SlotType getRequiredSlotType() {
        return SlotType.LARGE;
    }
}
