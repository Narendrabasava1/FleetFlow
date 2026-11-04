package com.fleetflow.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class PaymentPageController {

    @GetMapping("/payments")
    public String paymentsPage() {
        return "payments";
    }
}