
package com.fleetflow.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fleetflow.dto.CustomerRequest;
import com.fleetflow.entity.Customer;
import com.fleetflow.exception.ResourceNotFoundException;
import com.fleetflow.repository.CustomerRepository;

@Service
@Transactional
public class CustomerService {

    private final CustomerRepository customerRepository;

    public CustomerService(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    public Customer addCustomer(CustomerRequest request) {

        if (customerRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException(
                "Customer with this email already exists"
            );
        }

        Customer customer = new Customer();
        mapRequestToCustomer(request, customer);

        return customerRepository.save(customer);
    }

    @Transactional(readOnly = true)
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Customer getCustomerById(Long id) {
        return customerRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Customer not found with ID: " + id
            ));
    }

    public Customer updateCustomer(Long id, CustomerRequest request) {

        Customer customer = getCustomerById(id);

        if (!customer.getEmail().equalsIgnoreCase(request.getEmail())
                && customerRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException(
                "Customer with this email already exists"
            );
        }

        mapRequestToCustomer(request, customer);

        return customerRepository.save(customer);
    }

    public void deleteCustomer(Long id) {

        Customer customer = getCustomerById(id);

        customerRepository.delete(customer);
    }

    private void mapRequestToCustomer(
            CustomerRequest request, Customer customer) {

        customer.setFullName(request.getFullName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
    }
}
