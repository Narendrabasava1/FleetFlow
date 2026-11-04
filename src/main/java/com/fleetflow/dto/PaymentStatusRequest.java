
package com.fleetflow.dto;

import jakarta.validation.constraints.NotBlank;

public class PaymentStatusRequest {

    @NotBlank(message = "Payment status is required")
    private String status;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
