package com.parkeasy.parking;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Scanner;

/** Console menu for the ParkEasy parking-lot demo. */
public final class Main {
    private static final DateTimeFormatter TIME_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a")
                    .withZone(ZoneId.systemDefault());

    private Main() {
    }

    public static void main(String[] args) {
        ParkingLot lot = ParkingLot.getInstance();
        try (Scanner scanner = new Scanner(System.in)) {
            System.out.println("==================================");
            System.out.println("       ParkEasy Parking Lot       ");
            System.out.println("==================================");
            System.out.println("In-memory demo. Rates: Rs 50/hour or Rs 120 flat.");

            boolean running = true;
            while (running) {
                showMenu();
                String choice = scanner.nextLine().trim();
                try {
                    switch (choice) {
                        case "1" -> parkVehicle(scanner, lot);
                        case "2" -> exitVehicle(scanner, lot);
                        case "3" -> showSlots(lot);
                        case "4" -> showActiveTickets(lot);
                        case "5" -> showHistory(lot);
                        case "6" -> runDemo(lot);
                        case "0" -> running = false;
                        default -> System.out.println("Choose a menu option from 0 to 6.");
                    }
                } catch (IllegalArgumentException | IllegalStateException exception) {
                    System.out.println("Unable to complete that action: " + exception.getMessage());
                }
                System.out.println();
            }
            System.out.println("ParkEasy closed. All in-memory demo data has been cleared.");
        }
    }

    private static void showMenu() {
        System.out.println("1. Park a vehicle");
        System.out.println("2. Exit a vehicle and pay");
        System.out.println("3. Show parking slots");
        System.out.println("4. Show active tickets");
        System.out.println("5. Show completed history");
        System.out.println("6. Run a short demo");
        System.out.println("0. Exit");
        System.out.print("Choose an option: ");
    }

    private static void parkVehicle(Scanner scanner, ParkingLot lot) {
        System.out.print("Vehicle number: ");
        String number = scanner.nextLine();
        System.out.print("Vehicle type (Bike, Car, Truck): ");
        String type = scanner.nextLine();
        Ticket ticket = lot.park(VehicleFactory.createVehicle(type, number));
        System.out.println("Vehicle parked successfully.");
        printTicket(ticket);
    }

    private static void exitVehicle(Scanner scanner, ParkingLot lot) {
        System.out.print("Ticket ID: ");
        String ticketId = scanner.nextLine().trim();
        System.out.print("Fee strategy (Hourly or Flat): ");
        String feeChoice = scanner.nextLine().trim();
        System.out.print("Payment method (Card, UPI, Cash): ");
        String paymentChoice = scanner.nextLine().trim();

        FeeStrategy feeStrategy = createFeeStrategy(feeChoice);
        PaymentStrategy paymentStrategy = createPaymentStrategy(paymentChoice);
        Ticket ticket = lot.unpark(ticketId, feeStrategy, paymentStrategy);
        System.out.printf(
                "Exit complete. %s fee: Rs %.2f. Payment: %s.%n",
                feeStrategy.getName(),
                ticket.getFee(),
                ticket.getPaymentMethod());
    }

    private static FeeStrategy createFeeStrategy(String choice) {
        return switch (choice.toLowerCase()) {
            case "hourly" -> new HourlyFeeStrategy();
            case "flat" -> new FlatFeeStrategy();
            default -> throw new IllegalArgumentException(
                    "Choose Hourly or Flat for the fee strategy.");
        };
    }

    private static PaymentStrategy createPaymentStrategy(String choice) {
        return switch (choice.toLowerCase()) {
            case "card" -> new CardPayment();
            case "upi" -> new UpiPayment();
            case "cash" -> new CashPayment();
            default -> throw new IllegalArgumentException(
                    "Choose Card, UPI, or Cash for payment.");
        };
    }

    private static void showSlots(ParkingLot lot) {
        System.out.println("Parking slots:");
        for (ParkingSlot slot : lot.getSlots()) {
            System.out.println("  " + slot);
        }
        System.out.println("Available: " + lot.getAvailableSlotCount());
    }

    private static void showActiveTickets(ParkingLot lot) {
        List<Ticket> tickets = lot.getActiveTickets();
        if (tickets.isEmpty()) {
            System.out.println("No vehicles are currently parked.");
            return;
        }
        System.out.println("Active tickets:");
        tickets.forEach(Main::printTicket);
    }

    private static void showHistory(ParkingLot lot) {
        List<Ticket> tickets = lot.getCompletedTickets();
        if (tickets.isEmpty()) {
            System.out.println("No completed tickets yet.");
            return;
        }
        System.out.println("Completed tickets:");
        for (Ticket ticket : tickets) {
            System.out.printf(
                    "  %s | %s | Slot %d | %s | Rs %.2f | %s%n",
                    ticket.getId(),
                    ticket.getVehicle(),
                    ticket.getSlot().getId(),
                    TIME_FORMAT.format(ticket.getExitTime()),
                    ticket.getFee(),
                    ticket.getPaymentMethod());
        }
    }

    private static void runDemo(ParkingLot lot) {
        Ticket bikeTicket = lot.park(VehicleFactory.createVehicle("Bike", "DEMO-BIKE"));
        Ticket truckTicket = lot.park(VehicleFactory.createVehicle("Truck", "DEMO-TRUCK"));
        System.out.println("Demo parked two vehicles:");
        printTicket(bikeTicket);
        printTicket(truckTicket);

        FeeStrategy feeStrategy = new FlatFeeStrategy();
        Ticket completed = lot.unpark(
                bikeTicket.getId(),
                feeStrategy,
                new UpiPayment());
        System.out.printf(
                "Demo exit: %s, Rs %.2f via %s.%n",
                completed.getId(),
                completed.getFee(),
                completed.getPaymentMethod());
        System.out.println("The truck remains parked; completed history now has one entry.");
    }

    private static void printTicket(Ticket ticket) {
        System.out.printf(
                "  Ticket %s | %s | Slot %d (%s) | Entry %s%n",
                ticket.getId(),
                ticket.getVehicle(),
                ticket.getSlot().getId(),
                ticket.getSlot().getType(),
                TIME_FORMAT.format(ticket.getEntryTime()));
    }
}
