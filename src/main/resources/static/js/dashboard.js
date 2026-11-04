
// Load dashboard data when the page opens
document.addEventListener("DOMContentLoaded", function () {
    loadVehicles();
    loadCustomers();
    loadBookings();
    loadPayments();
});

// Load vehicles
async function loadVehicles() {
    try {
        const response = await fetch("/api/vehicles");
        if (!response.ok) throw new Error("Unable to load vehicles");

        const vehicles = await response.json();

        document.getElementById("totalVehicles").textContent =
            vehicles.length;

        const table = document.getElementById("vehicleTable");

        if (vehicles.length === 0) {
            table.innerHTML =
                '<tr><td colspan="6">No vehicles found</td></tr>';
            return;
        }

        table.innerHTML = vehicles.map(vehicle => `
            <tr>
                <td>${vehicle.id}</td>
                <td>${vehicle.vehicleName}</td>
                <td>${vehicle.brand}</td>
                <td>${vehicle.registrationNumber}</td>
                <td>₹${vehicle.pricePerDay}</td>
                <td>
                    <span class="status ${vehicle.available ? 'available' : 'unavailable'}">
                        ${vehicle.available ? 'Available' : 'Unavailable'}
                    </span>
                </td>
            </tr>
        `).join("");

    } catch (error) {
        console.error("Vehicle error:", error);
        document.getElementById("vehicleTable").innerHTML =
            '<tr><td colspan="6">Unable to load vehicles</td></tr>';
    }
}

// Load customers
async function loadCustomers() {
    try {
        const response = await fetch("/api/customers");
        if (!response.ok) throw new Error("Unable to load customers");

        const customers = await response.json();

        document.getElementById("totalCustomers").textContent =
            customers.length;

    } catch (error) {
        console.error("Customer error:", error);
        document.getElementById("totalCustomers").textContent = "!";
    }
}

// Load bookings
async function loadBookings() {
    try {
        const response = await fetch("/api/bookings");
        if (!response.ok) throw new Error("Unable to load bookings");

        const bookings = await response.json();

        document.getElementById("totalBookings").textContent =
            bookings.length;

        const table = document.getElementById("bookingTable");

        if (bookings.length === 0) {
            table.innerHTML =
                '<tr><td colspan="6">No bookings found</td></tr>';
            return;
        }

        table.innerHTML = bookings.map(booking => `
            <tr>
                <td>${booking.id}</td>
                <td>${booking.customer?.fullName ?? "N/A"}</td>
                <td>${booking.vehicle?.vehicleName ?? "N/A"}</td>
                <td>${booking.totalDays}</td>
                <td>₹${booking.totalPrice}</td>
                <td>
                    <span class="status ${booking.status === 'CANCELLED' ? 'cancelled' : 'confirmed'}">
                        ${booking.status}
                    </span>
                </td>
            </tr>
        `).join("");

    } catch (error) {
        console.error("Booking error:", error);
        document.getElementById("bookingTable").innerHTML =
            '<tr><td colspan="6">Unable to load bookings</td></tr>';
    }
}

// Load payments
async function loadPayments() {
    try {
        const response = await fetch("/api/payments");
        if (!response.ok) throw new Error("Unable to load payments");

        const payments = await response.json();

        document.getElementById("totalPayments").textContent =
            payments.length;

    } catch (error) {
        console.error("Payment error:", error);
        document.getElementById("totalPayments").textContent = "!";
    }
}
