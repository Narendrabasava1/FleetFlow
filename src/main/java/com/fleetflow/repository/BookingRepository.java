
package com.fleetflow.repository;

import java.time.LocalDate;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.fleetflow.entity.Booking;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("""
        SELECT COUNT(b) > 0
        FROM Booking b
        WHERE b.vehicle.id = :vehicleId
        AND b.status <> 'CANCELLED'
        AND b.pickupDate < :returnDate
        AND b.returnDate > :pickupDate
    """)
    boolean hasOverlappingBooking(
        @Param("vehicleId") Long vehicleId,
        @Param("pickupDate") LocalDate pickupDate,
        @Param("returnDate") LocalDate returnDate
    );
}
