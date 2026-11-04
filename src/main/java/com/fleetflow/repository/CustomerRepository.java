
package com.fleetflow.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.fleetflow.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {

    boolean existsByEmail(String email);
}
