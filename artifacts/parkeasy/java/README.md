# ParkEasy Java console app

A dependency-free Java implementation of the ParkEasy parking-lot demo. It uses only in-memory state; closing the program resets the lot.

## Run

From this directory:

```sh
javac -d out src/main/java/com/parkeasy/parking/*.java
java -cp out com.parkeasy.parking.Main
```

Choose `6` from the menu for a short demonstration, or use the other options to park and exit vehicles yourself.

Rates used by the demo:

- Hourly: Rs 50 per started hour, with a one-hour minimum.
- Flat: Rs 120 per visit.

Payment methods are simulations only; no real payment is taken.

## Patterns used

- **Singleton — `ParkingLot`:** the holder idiom creates one thread-safe lot instance. Its synchronized operations keep slot and ticket changes consistent.
- **Factory — `VehicleFactory`:** converts a type string into a `Bike`, `Car`, or `Truck`, keeping creation and validation out of the menu code.
- **Strategy — `FeeStrategy`:** `HourlyFeeStrategy` and `FlatFeeStrategy` can calculate the same ticket's fee using different rules.
- **Strategy — `PaymentStrategy`:** `CardPayment`, `UpiPayment`, and `CashPayment` share a payment interface, so the exit flow does not need method-specific branches.

Vehicles use exact slot matching in this demo: Bike → SMALL, Car → MEDIUM, Truck → LARGE. The lot assigns the lowest-numbered free matching slot.

## Text class diagram

```text
                         +----------------------+
                         |      ParkingLot      |
                         | Singleton (holder)   |
                         | slots, active, done  |
                         +----------+-----------+
                                    | owns
                    +---------------+---------------+
                    |                               |
             +------v------+                 +------v------+
             | ParkingSlot |                 |   Ticket    |
             +-------------+                 +------+------+
                                                    | vehicle
                                           +--------v--------+
                                           |     Vehicle     | (abstract)
                                           +--------+--------+
                                                    ^
                              +---------------------+---------------------+
                              |                     |                     |
                           +--+--+                +--+--+              +---+---+
                           | Bike |                | Car |              | Truck |
                           +-----+                +-----+              +-------+
                              ^
                              | creates
                       +------+---------+
                       | VehicleFactory |
                       +----------------+

  ParkingLot.unpark(...) --> FeeStrategy
                              ^       ^
                              |       |
                       HourlyFee   FlatFee

  ParkingLot.unpark(...) --> PaymentStrategy
                               ^       ^       ^
                               |       |       |
                             Card     UPI     Cash

  Main --> ParkingLot, VehicleFactory, FeeStrategy, PaymentStrategy
```
