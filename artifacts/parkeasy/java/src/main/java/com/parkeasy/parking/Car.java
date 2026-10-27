package com.parkeasy.parking;

public final class Car extends Vehicle {
    public Car(String number) {
        super(number);
    }

    @Override
    public String getTypeName() {
        return "Car";
    }

    @Override
    public SlotType getRequiredSlotType() {
        return SlotType.MEDIUM;
    }
}
