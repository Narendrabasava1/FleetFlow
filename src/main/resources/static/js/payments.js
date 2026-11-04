const PAYMENT_API = "/api/payments";
const BOOKING_API = "/api/bookings";

let payments = [];
let bookings = [];

const paymentForm = document.getElementById("paymentForm");
const paymentTableBody = document.getElementById("paymentTableBody");

async function loadBookings() {
    const bookingSelect = document.getElementById("bookingId");

    try {
        const response = await fetch(BOOKING_API);

        if (!response.ok) {
            throw new Error("Unable to load bookings");
        }

        bookings = await response.json();

        bookingSelect.innerHTML =
            '<option value="">Select a booking</option>';

        bookings
            .filter(booking => booking.status === "CONFIRMED")
            .forEach(booking => {
                const option = document.createElement("option");

                option.value = booking.id;
                option.textContent =
                    `Booking #${booking.id} - ₹${booking.totalPrice}`;

                bookingSelect.appendChild(option);
            });

        if (bookingSelect.options.length === 1) {
            bookingSelect.innerHTML =
                '<option value="">No confirmed bookings available</option>';
        }

    } catch (error) {
        bookingSelect.innerHTML =
            '<option value="">Failed to load bookings</option>';

        console.error(error);
    }
}

async function loadPayments() {
    try {
        const response = await fetch(PAYMENT_API);

        if (!response.ok) {
            throw new Error("Unable to load payments");
        }

        payments = await response.json();

        updatePaymentStatistics();
        displayPayments(payments);

    } catch (error) {
        paymentTableBody.innerHTML =
            '<tr><td colspan="7">Failed to load payments</td></tr>';

        console.error(error);
    }
}

function updatePaymentStatistics() {

    const successful = payments.filter(
        payment => payment.status === "SUCCESS"
    );

    const pending = payments.filter(
        payment => payment.status === "PENDING"
    );

    const revenue = successful.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0
    );

    document.getElementById("totalPayments").textContent =
        payments.length;

    document.getElementById("successfulPayments").textContent =
        successful.length;

    document.getElementById("pendingPayments").textContent =
        pending.length;

    document.getElementById("totalRevenue").textContent =
        "₹" + revenue.toLocaleString("en-IN");
}

function displayPayments(paymentList) {

    paymentTableBody.innerHTML = "";

    if (paymentList.length === 0) {
        paymentTableBody.innerHTML =
            '<tr><td colspan="7">No payments found</td></tr>';
        return;
    }

    paymentList.forEach(payment => {

        const row = document.createElement("tr");

        const bookingId = payment.booking?.id ?? "-";

        let date = "-";

        if (payment.paymentDate) {
            date = new Date(payment.paymentDate).toLocaleDateString("en-IN");
        }

        const statusClass = {
            SUCCESS: "status-success",
            PENDING: "status-pending",
            FAILED: "status-failed"
        }[payment.status] || "";

        const values = [
            payment.id,
            bookingId,
            "₹" + Number(payment.amount || 0).toLocaleString("en-IN"),
            payment.paymentMethod,
            date
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value ?? "-";
            row.appendChild(cell);
        });

        const statusCell = document.createElement("td");

        const statusBadge = document.createElement("span");
        statusBadge.className = `status ${statusClass}`;
        statusBadge.textContent = payment.status;

        statusCell.appendChild(statusBadge);
        row.appendChild(statusCell);

        const updateCell = document.createElement("td");

        const statusSelect = document.createElement("select");
        statusSelect.className = "status-select";

        ["PENDING", "SUCCESS", "FAILED"].forEach(status => {
            const option = document.createElement("option");
            option.value = status;
            option.textContent = status;
            statusSelect.appendChild(option);
        });

        statusSelect.value = payment.status;

        const updateButton = document.createElement("button");
        updateButton.className = "update-btn";
        updateButton.textContent = "Update";

        updateButton.addEventListener("click", () => {
            updatePaymentStatus(payment.id, statusSelect.value);
        });

        updateCell.append(statusSelect, updateButton);
        row.appendChild(updateCell);

        paymentTableBody.appendChild(row);
    });
}

document.getElementById("bookingId").addEventListener("change", function() {

    const selectedBooking = bookings.find(
        booking => String(booking.id) === this.value
    );

    document.getElementById("paymentAmount").value =
        selectedBooking
            ? "₹" + Number(selectedBooking.totalPrice).toLocaleString("en-IN")
            : "";
});

paymentForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const bookingId = document.getElementById("bookingId").value;
    const paymentMethod = document.getElementById("paymentMethod").value;
    const button = document.getElementById("createPaymentBtn");

    if (!bookingId || !paymentMethod) {
        showPaymentMessage("Please select a booking and payment method.", "error");
        return;
    }

    const paymentData = {
        bookingId: Number(bookingId),
        paymentMethod: paymentMethod
    };

    button.disabled = true;

    try {
        const response = await fetch(PAYMENT_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(paymentData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Payment creation failed");
        }

        showPaymentMessage("Payment created successfully!", "success");

        paymentForm.reset();
        document.getElementById("paymentAmount").value = "";

        await loadPayments();

    } catch (error) {
        showPaymentMessage(error.message, "error");

    } finally {
        button.disabled = false;
    }
});

async function updatePaymentStatus(paymentId, status) {

    try {
        const response = await fetch(
            `${PAYMENT_API}/${paymentId}/status`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ status: status })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Status update failed");
        }

        showPaymentMessage("Payment status updated successfully!", "success");

        await loadPayments();

    } catch (error) {
        showPaymentMessage(error.message, "error");
    }
}

function showPaymentMessage(message, type) {

    const element = document.getElementById("paymentMessage");

    element.textContent = message;
    element.style.color =
        type === "success" ? "#4ade80" : "#ff6b6b";
}

document.getElementById("searchPayment").addEventListener("input", function() {

    const searchText = this.value.toLowerCase();

    const filteredPayments = payments.filter(payment => {

        const paymentId = String(payment.id);
        const bookingId = String(payment.booking?.id ?? "");

        return paymentId.includes(searchText) ||
               bookingId.includes(searchText) ||
               (payment.paymentMethod || "").toLowerCase().includes(searchText) ||
               (payment.status || "").toLowerCase().includes(searchText);
    });

    displayPayments(filteredPayments);
});

async function initializePaymentsPage() {
    await loadBookings();
    await loadPayments();
}

initializePaymentsPage();