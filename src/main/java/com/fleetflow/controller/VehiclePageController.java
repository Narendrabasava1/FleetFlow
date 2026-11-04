
package com.fleetflow.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class VehiclePageController {

    @GetMapping("/vehicles")
    public String vehiclesPage() {
        return "vehicles";
    }
}
