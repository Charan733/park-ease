package com.parkeasy.parking;

import java.time.Duration;
import java.time.Instant;

/** Charges Rs 50 for every started hour, with a one-hour minimum. */
public final class HourlyFeeStrategy implements FeeStrategy {
    private static final double HOURLY_RATE = 50.0;

    @Override
    public double calculateFee(Instant entryTime, Instant exitTime) {
        long elapsedMillis = Math.max(0, Duration.between(entryTime, exitTime).toMillis());
        long billableHours = Math.max(1, (long) Math.ceil(elapsedMillis / 3_600_000.0));
        return billableHours * HOURLY_RATE;
    }

    @Override
    public String getName() {
        return "Hourly";
    }
}
