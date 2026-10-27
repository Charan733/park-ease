package com.parkeasy.parking;

import java.time.Instant;

/** A replaceable rule for calculating a parking fee. */
public interface FeeStrategy {
    double calculateFee(Instant entryTime, Instant exitTime);

    String getName();
}
