export type VehicleType = 'Bike' | 'Car' | 'Truck';
export type SlotType = 'Small' | 'Medium' | 'Large';

export interface Vehicle {
  number: string;
  type: VehicleType;
  requiredSlotType: SlotType;
}

abstract class BaseVehicle implements Vehicle {
  readonly number: string;
  abstract readonly type: VehicleType;
  abstract readonly requiredSlotType: SlotType;

  protected constructor(number: string) {
    this.number = number.trim().toUpperCase();
  }
}

export class Bike extends BaseVehicle {
  readonly type = 'Bike' as const;
  readonly requiredSlotType = 'Small' as const;

  constructor(number: string) {
    super(number);
  }
}

export class Car extends BaseVehicle {
  readonly type = 'Car' as const;
  readonly requiredSlotType = 'Medium' as const;

  constructor(number: string) {
    super(number);
  }
}

export class Truck extends BaseVehicle {
  readonly type = 'Truck' as const;
  readonly requiredSlotType = 'Large' as const;

  constructor(number: string) {
    super(number);
  }
}

export class VehicleFactory {
  static create(number: string, type: VehicleType): Vehicle {
    const normalized = number.trim().toUpperCase();
    if (!normalized || normalized.length > 12 || !/^[A-Z0-9-]+$/.test(normalized)) {
      throw new Error('Enter a vehicle number using letters, numbers, or hyphens (up to 12 characters).');
    }
    switch (type) {
      case 'Bike': return new Bike(normalized);
      case 'Car': return new Car(normalized);
      case 'Truck': return new Truck(normalized);
      default: throw new Error('Choose a valid vehicle type.');
    }
  }
}
