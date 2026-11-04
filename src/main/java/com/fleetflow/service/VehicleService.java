
package com.fleetflow.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fleetflow.dto.VehicleRequest;
import com.fleetflow.entity.Vehicle;
import com.fleetflow.exception.ResourceNotFoundException;
import com.fleetflow.repository.VehicleRepository;

@Service
@Transactional
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    public Vehicle addVehicle(VehicleRequest request) {

        if (vehicleRepository.existsByRegistrationNumber(
                request.getRegistrationNumber())) {
            throw new IllegalArgumentException(
                    "Vehicle registration number already exists");
        }

        Vehicle vehicle = new Vehicle();
        mapRequestToVehicle(request, vehicle);

        return vehicleRepository.save(vehicle);
    }

    @Transactional(readOnly = true)
    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Vehicle getVehicleById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Vehicle not found with ID: " + id));
    }

    public Vehicle updateVehicle(Long id, VehicleRequest request) {

        Vehicle vehicle = getVehicleById(id);

        if (!vehicle.getRegistrationNumber()
                .equalsIgnoreCase(request.getRegistrationNumber())
                && vehicleRepository.existsByRegistrationNumber(
                        request.getRegistrationNumber())) {
            throw new IllegalArgumentException(
                    "Vehicle registration number already exists");
        }

        mapRequestToVehicle(request, vehicle);

        return vehicleRepository.save(vehicle);
    }

    public void deleteVehicle(Long id) {

        Vehicle vehicle = getVehicleById(id);

        vehicleRepository.delete(vehicle);
    }

    private void mapRequestToVehicle(
            VehicleRequest request, Vehicle vehicle) {

        vehicle.setVehicleName(request.getVehicleName());
        vehicle.setBrand(request.getBrand());
        vehicle.setModel(request.getModel());
        vehicle.setRegistrationNumber(request.getRegistrationNumber());
        vehicle.setFuelType(request.getFuelType());
        vehicle.setPricePerDay(request.getPricePerDay());
        vehicle.setAvailable(
                request.getAvailable() == null
                        || request.getAvailable());
    }
}
