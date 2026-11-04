
package com.fleetflow.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fleetflow.dto.PaymentRequest;
import com.fleetflow.entity.Booking;
import com.fleetflow.entity.Payment;
import com.fleetflow.exception.ResourceNotFoundException;
import com.fleetflow.repository.BookingRepository;
import com.fleetflow.repository.PaymentRepository;

@Service
@Transactional
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;

    public PaymentService(
            PaymentRepository paymentRepository,
            BookingRepository bookingRepository) {

        this.paymentRepository = paymentRepository;
        this.bookingRepository = bookingRepository;
    }

    // Initiate a payment
    public Payment createPayment(PaymentRequest request) {

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Booking not found with ID: " + request.getBookingId()));

        if ("CANCELLED".equalsIgnoreCase(booking.getStatus())) {
            throw new IllegalArgumentException(
                    "Cannot make payment for a cancelled booking");
        }

        if (paymentRepository.existsByBookingIdAndStatus(
                booking.getId(), "SUCCESS")) {

            throw new IllegalArgumentException(
                    "This booking has already been paid successfully");
        }

        String method = request.getPaymentMethod().trim().toUpperCase();

        if (!method.equals("CASH")
                && !method.equals("UPI")
                && !method.equals("CARD")) {

            throw new IllegalArgumentException(
                    "Payment method must be CASH, UPI or CARD");
        }

        Payment payment = new Payment();

        payment.setBooking(booking);
        payment.setAmount(booking.getTotalPrice());
        payment.setPaymentMethod(method);
        payment.setStatus("PENDING");
        payment.setPaymentDate(LocalDateTime.now());

        return paymentRepository.save(payment);
    }

    // Update payment result (simulated payment processing)
    public Payment updatePaymentStatus(Long paymentId, String newStatus) {

        Payment payment = getPaymentById(paymentId);

        String status = newStatus.trim().toUpperCase();

        if (!status.equals("SUCCESS") && !status.equals("FAILED")) {
            throw new IllegalArgumentException(
                    "Payment status must be SUCCESS or FAILED");
        }

        if (!"PENDING".equals(payment.getStatus())) {
            throw new IllegalArgumentException(
                    "Only pending payments can be updated");
        }

        if ("SUCCESS".equals(status)
                && paymentRepository.existsByBookingIdAndStatus(
                        payment.getBooking().getId(), "SUCCESS")) {

            throw new IllegalArgumentException(
                    "This booking already has a successful payment");
        }

        payment.setStatus(status);

        return paymentRepository.save(payment);
    }

    @Transactional(readOnly = true)
    public List<Payment> getAllPayments() {
        return paymentRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Payment getPaymentById(Long id) {

        return paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Payment not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<Payment> getPaymentsByBooking(Long bookingId) {

        if (!bookingRepository.existsById(bookingId)) {
            throw new ResourceNotFoundException(
                    "Booking not found with ID: " + bookingId);
        }

        return paymentRepository.findByBookingId(bookingId);
    }
}
