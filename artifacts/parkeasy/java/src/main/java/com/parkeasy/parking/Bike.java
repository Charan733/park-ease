package com.parkeasy.parking;

public final class Bike extends Vehicle {
    public Bike(String number) {
        super(number);
    }

    @Override
    public String getTypeName() {
        return "Bike";
    }

    @Override
    public SlotType getRequiredSlotType() {
        return SlotType.SMALL;
    }
}
