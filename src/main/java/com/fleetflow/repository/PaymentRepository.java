
package com.fleetflow.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.fleetflow.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    boolean existsByBookingIdAndStatus(Long bookingId, String status);

    List<Payment> findByBookingId(Long bookingId);
}
