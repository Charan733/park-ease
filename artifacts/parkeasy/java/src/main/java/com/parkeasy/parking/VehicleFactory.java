package com.parkeasy.parking;

/** Creates the right Vehicle subclass from a user-entered type. */
public final class VehicleFactory {
    private VehicleFactory() {
    }

    public static Vehicle createVehicle(String type, String number) {
        if (type == null) {
            throw new IllegalArgumentException("Vehicle type must be Bike, Car, or Truck.");
        }

        return switch (type.trim().toLowerCase()) {
            case "bike" -> new Bike(number);
            case "car" -> new Car(number);
            case "truck" -> new Truck(number);
            default -> throw new IllegalArgumentException(
                    "Unknown vehicle type. Choose Bike, Car, or Truck.");
        };
    }
}
