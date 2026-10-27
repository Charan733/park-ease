package com.parkeasy.parking;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Thread-safe singleton that owns all slot and ticket state for one lot.
 * The initialization-on-demand holder idiom safely creates the single instance.
 */
public final class ParkingLot {
    private final List<ParkingSlot> slots = new ArrayList<>();
    private final Map<String, Ticket> activeTickets = new LinkedHashMap<>();
    private final List<Ticket> completedTickets = new ArrayList<>();
    private int nextTicketNumber = 1001;

    private ParkingLot() {
        addSlots(1, 3, SlotType.SMALL);
        addSlots(4, 5, SlotType.MEDIUM);
        addSlots(9, 3, SlotType.LARGE);
    }

    private static class InstanceHolder {
        private static final ParkingLot INSTANCE = new ParkingLot();
    }

    public static ParkingLot getInstance() {
        return InstanceHolder.INSTANCE;
    }

    private void addSlots(int firstId, int count, SlotType type) {
        for (int offset = 0; offset < count; offset++) {
            slots.add(new ParkingSlot(firstId + offset, type));
        }
    }

    /** Parks in the lowest-numbered free slot of the exact required size. */
    public synchronized Ticket park(Vehicle vehicle) {
        ParkingSlot slot = slots.stream()
                .filter(candidate -> !candidate.isOccupied())
                .filter(candidate -> candidate.getType() == vehicle.getRequiredSlotType())
                .min(Comparator.comparingInt(ParkingSlot::getId))
                .orElseThrow(() -> new IllegalStateException(
                        "No free " + vehicle.getRequiredSlotType() + " slot is available."));

        String ticketId = "PK-" + nextTicketNumber++;
        slot.occupy();
        Ticket ticket = new Ticket(ticketId, vehicle, slot, Instant.now());
        activeTickets.put(ticketId, ticket);
        return ticket;
    }

    /**
     * Calculates and collects payment before releasing the slot. A failed
     * payment leaves the ticket and slot active.
     */
    public synchronized Ticket unpark(
            String ticketId,
            FeeStrategy feeStrategy,
            PaymentStrategy paymentStrategy) {
        Ticket ticket = activeTickets.get(ticketId);
        if (ticket == null) {
            throw new IllegalArgumentException(
                    "Ticket not found or already completed: " + ticketId);
        }

        Instant exitTime = Instant.now();
        double fee = feeStrategy.calculateFee(ticket.getEntryTime(), exitTime);
        if (!paymentStrategy.pay(fee)) {
            throw new IllegalStateException("Payment was not completed; the vehicle remains parked.");
        }

        ticket.complete(exitTime, fee, paymentStrategy.getName());
        ticket.getSlot().vacate();
        activeTickets.remove(ticketId);
        completedTickets.add(ticket);
        return ticket;
    }

    public synchronized List<ParkingSlot> getSlots() {
        return List.copyOf(slots);
    }

    public synchronized List<Ticket> getActiveTickets() {
        return List.copyOf(activeTickets.values());
    }

    public synchronized List<Ticket> getCompletedTickets() {
        return List.copyOf(completedTickets);
    }

    public synchronized int getAvailableSlotCount() {
        return (int) slots.stream().filter(slot -> !slot.isOccupied()).count();
    }
}
