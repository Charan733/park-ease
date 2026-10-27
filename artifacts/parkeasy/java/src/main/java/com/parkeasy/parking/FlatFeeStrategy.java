package com.parkeasy.parking;

import java.time.Instant;

/** Charges a fixed Rs 120 per visit, regardless of parking duration. */
public final class FlatFeeStrategy implements FeeStrategy {
    private static final double FLAT_RATE = 120.0;

    @Override
    public double calculateFee(Instant entryTime, Instant exitTime) {
        return FLAT_RATE;
    }

    @Override
    public String getName() {
        return "Flat";
    }
}
