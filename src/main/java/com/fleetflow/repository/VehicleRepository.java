
package com.fleetflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.fleetflow.entity.Vehicle;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    boolean existsByRegistrationNumber(String registrationNumber);

}
