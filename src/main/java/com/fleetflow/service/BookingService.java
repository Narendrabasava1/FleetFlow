
package com.fleetflow.service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fleetflow.dto.BookingRequest;
import com.fleetflow.entity.Booking;
import com.fleetflow.entity.Customer;
import com.fleetflow.entity.Vehicle;
import com.fleetflow.exception.ResourceNotFoundException;
import com.fleetflow.repository.BookingRepository;
import com.fleetflow.repository.CustomerRepository;
import com.fleetflow.repository.VehicleRepository;

@Service
@Transactional
public class BookingService {

    private final BookingRepository bookingRepository;
    private final CustomerRepository customerRepository;
    private final VehicleRepository vehicleRepository;

    public BookingService(
            BookingRepository bookingRepository,
            CustomerRepository customerRepository,
            VehicleRepository vehicleRepository) {

        this.bookingRepository = bookingRepository;
        this.customerRepository = customerRepository;
        this.vehicleRepository = vehicleRepository;
    }

    public Booking createBooking(BookingRequest request) {

        // Validate rental dates
        validateDates(request.getPickupDate(), request.getReturnDate());

        // Find customer
        Customer customer = customerRepository.findById(request.getCustomerId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Customer not found with ID: " + request.getCustomerId()));

        // Find vehicle
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Vehicle not found with ID: " + request.getVehicleId()));

        // Check vehicle availability
        if (!vehicle.isAvailable()) {
            throw new IllegalArgumentException(
                    "Vehicle is currently unavailable");
        }

        // Check overlapping bookings
        boolean overlapping = bookingRepository.hasOverlappingBooking(
                vehicle.getId(),
                request.getPickupDate(),
                request.getReturnDate());

        if (overlapping) {
            throw new IllegalArgumentException(
                    "Vehicle is already booked for the selected dates");
        }

        // Calculate rental duration
        long totalDays = ChronoUnit.DAYS.between(
                request.getPickupDate(),
                request.getReturnDate());

        // Calculate total rental price
        double totalPrice = totalDays * vehicle.getPricePerDay();

        // Create booking
        Booking booking = new Booking();

        booking.setCustomer(customer);
        booking.setVehicle(vehicle);
        booking.setPickupDate(request.getPickupDate());
        booking.setReturnDate(request.getReturnDate());
        booking.setTotalDays(totalDays);
        booking.setTotalPrice(totalPrice);
        booking.setStatus("CONFIRMED");

        return bookingRepository.save(booking);
    }

    @Transactional(readOnly = true)
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Booking getBookingById(Long id) {

        return bookingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Booking not found with ID: " + id));
    }

    public Booking cancelBooking(Long id) {

        Booking booking = getBookingById(id);

        if ("CANCELLED".equals(booking.getStatus())) {
            throw new IllegalArgumentException(
                    "Booking is already cancelled");
        }

        booking.setStatus("CANCELLED");

        return bookingRepository.save(booking);
    }

    private void validateDates(LocalDate pickupDate, LocalDate returnDate) {

        if (pickupDate == null || returnDate == null) {
            throw new IllegalArgumentException(
                    "Pickup date and return date are required");
        }

        if (pickupDate.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "Pickup date cannot be in the past");
        }

        if (!returnDate.isAfter(pickupDate)) {
            throw new IllegalArgumentException(
                    "Return date must be after pickup date");
        }
    }
}
