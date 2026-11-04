
const BOOKING_API = "/api/bookings";
const CUSTOMER_API = "/api/customers";
const VEHICLE_API = "/api/vehicles";

let bookings = [];
let customers = [];
let vehicles = [];

const bookingForm = document.getElementById("bookingForm");
const bookingTableBody = document.getElementById("bookingTableBody");

async function loadCustomers() {
    const select = document.getElementById("customerId");

    try {
        const response = await fetch(CUSTOMER_API);

        if (!response.ok) {
            throw new Error("Unable to load customers");
        }

        customers = await response.json();

        select.innerHTML = '<option value="">Select Customer</option>';

        customers.forEach(customer => {
            const option = document.createElement("option");
            option.value = customer.id;
            option.textContent = customer.fullName;
            select.appendChild(option);
        });

    } catch (error) {
        select.innerHTML = '<option value="">Failed to load customers</option>';
        console.error(error);
    }
}

async function loadVehicles() {
    const select = document.getElementById("vehicleId");

    try {
        const response = await fetch(VEHICLE_API);

        if (!response.ok) {
            throw new Error("Unable to load vehicles");
        }

        vehicles = await response.json();

        select.innerHTML = '<option value="">Select Vehicle</option>';

        vehicles
            .filter(vehicle => vehicle.available === true)
            .forEach(vehicle => {
                const option = document.createElement("option");

                option.value = vehicle.id;
                option.textContent =
                    `${vehicle.brand} ${vehicle.model} - ₹${vehicle.pricePerDay}/day`;

                select.appendChild(option);
            });

    } catch (error) {
        select.innerHTML = '<option value="">Failed to load vehicles</option>';
        console.error(error);
    }
}

async function loadBookings() {
    try {
        const response = await fetch(BOOKING_API);

        if (!response.ok) {
            throw new Error("Unable to load bookings");
        }

        bookings = await response.json();

        updateBookingStatistics();
        displayBookings(bookings);

    } catch (error) {
        bookingTableBody.innerHTML =
            '<tr><td colspan="9">Failed to load bookings</td></tr>';

        console.error(error);
    }
}

function updateBookingStatistics() {
    document.getElementById("totalBookings").textContent =
        bookings.length;

    document.getElementById("confirmedBookings").textContent =
        bookings.filter(b => b.status === "CONFIRMED").length;

    document.getElementById("cancelledBookings").textContent =
        bookings.filter(b => b.status === "CANCELLED").length;
}

function displayBookings(bookingList) {
    bookingTableBody.innerHTML = "";

    if (bookingList.length === 0) {
        bookingTableBody.innerHTML =
            '<tr><td colspan="9">No bookings found</td></tr>';
        return;
    }

    bookingList.forEach(booking => {
        const row = document.createElement("tr");

        const customerName =
            booking.customer?.fullName || "-";

        const vehicleName = booking.vehicle
            ? `${booking.vehicle.brand || ""} ${booking.vehicle.model || ""}`.trim()
            : "-";

        const values = [
            booking.id,
            customerName,
            vehicleName,
            booking.pickupDate || "-",
            booking.returnDate || "-",
            booking.totalDays ?? "-",
            "₹" + Number(booking.totalPrice || 0).toLocaleString("en-IN")
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value;
            row.appendChild(cell);
        });

        const statusCell = document.createElement("td");
        const statusBadge = document.createElement("span");

        statusBadge.className =
            `booking-status ${booking.status === "CONFIRMED" ? "confirmed" : "cancelled"}`;

        statusBadge.textContent = booking.status;
        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);

        const actionCell = document.createElement("td");

        const cancelButton = document.createElement("button");
        cancelButton.textContent = "Cancel";
        cancelButton.className = "cancel-booking-btn";

        cancelButton.disabled = booking.status !== "CONFIRMED";

        cancelButton.addEventListener("click", () => {
            cancelBooking(booking.id);
        });

        actionCell.appendChild(cancelButton);
        row.appendChild(actionCell);

        bookingTableBody.appendChild(row);
    });
}

function calculateBookingEstimate() {
    const vehicleId = document.getElementById("vehicleId").value;
    const pickupDate = document.getElementById("pickupDate").value;
    const returnDate = document.getElementById("returnDate").value;

    const vehicle = vehicles.find(
        v => String(v.id) === vehicleId
    );

    if (!vehicle || !pickupDate || !returnDate) {
        document.getElementById("totalDays").textContent = "0";
        document.getElementById("totalPrice").textContent = "₹0";
        return;
    }

    const start = new Date(pickupDate + "T00:00:00");
    const end = new Date(returnDate + "T00:00:00");

    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    if (days <= 0) {
        document.getElementById("totalDays").textContent = "0";
        document.getElementById("totalPrice").textContent = "₹0";
        return;
    }

    const total = days * Number(vehicle.pricePerDay);

    document.getElementById("totalDays").textContent = days;

    document.getElementById("totalPrice").textContent =
        "₹" + total.toLocaleString("en-IN");
}

document.getElementById("vehicleId")
    .addEventListener("change", calculateBookingEstimate);

document.getElementById("pickupDate")
    .addEventListener("change", calculateBookingEstimate);

document.getElementById("returnDate")
    .addEventListener("change", calculateBookingEstimate);

document.getElementById("pickupDate").addEventListener("change", function() {
    document.getElementById("returnDate").min = this.value;
});

bookingForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const customerId = document.getElementById("customerId").value;
    const vehicleId = document.getElementById("vehicleId").value;
    const pickupDate = document.getElementById("pickupDate").value;
    const returnDate = document.getElementById("returnDate").value;

    if (new Date(returnDate) <= new Date(pickupDate)) {
        showBookingMessage("Return date must be after pickup date.", "error");
        return;
    }

    const bookingData = {
        customerId: Number(customerId),
        vehicleId: Number(vehicleId),
        pickupDate: pickupDate,
        returnDate: returnDate
    };

    const button = document.getElementById("createBookingBtn");
    button.disabled = true;

    try {
        const response = await fetch(BOOKING_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bookingData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Unable to create booking");
        }

        showBookingMessage("Booking created successfully!", "success");

        bookingForm.reset();

        document.getElementById("returnDate").min = "";
        document.getElementById("totalDays").textContent = "0";
        document.getElementById("totalPrice").textContent = "₹0";

        await loadBookings();

    } catch (error) {
        showBookingMessage(error.message, "error");

    } finally {
        button.disabled = false;
    }
});

async function cancelBooking(id) {
    if (!confirm("Are you sure you want to cancel this booking?")) {
        return;
    }

    try {
        const response = await fetch(`${BOOKING_API}/${id}/cancel`, {
            method: "PUT"
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Unable to cancel booking");
        }

        showBookingMessage("Booking cancelled successfully!", "success");

        await loadBookings();

    } catch (error) {
        showBookingMessage(error.message, "error");
    }
}

function showBookingMessage(message, type) {
    const element = document.getElementById("bookingMessage");

    element.textContent = message;
    element.style.color =
        type === "success" ? "#4ade80" : "#ff6b6b";
}

document.getElementById("searchBooking").addEventListener("input", function() {
    const searchText = this.value.toLowerCase();

    const filteredBookings = bookings.filter(booking => {
        const customerName = booking.customer?.fullName || "";
        const vehicleName =
            `${booking.vehicle?.brand || ""} ${booking.vehicle?.model || ""}`;

        return String(booking.id).includes(searchText) ||
            customerName.toLowerCase().includes(searchText) ||
            vehicleName.toLowerCase().includes(searchText) ||
            (booking.status || "").toLowerCase().includes(searchText);
    });

    displayBookings(filteredBookings);
});

async function initializeBookingPage() {
    await Promise.all([
        loadCustomers(),
        loadVehicles()
    ]);

    await loadBookings();
}

initializeBookingPage();
