const API_URL = "/api/customers";

let customers = [];

const customerForm = document.getElementById("customerForm");
const customerTableBody = document.getElementById("customerTableBody");

async function loadCustomers() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to load customers");
        }

        customers = await response.json();

        document.getElementById("totalCustomers").textContent =
            customers.length;

        displayCustomers(customers);

    } catch (error) {
        customerTableBody.innerHTML =
            `<tr><td colspan="6">Failed to load customers. Please refresh.</td></tr>`;

        console.error(error);
    }
}

function displayCustomers(customerList) {

    customerTableBody.innerHTML = "";

    if (customerList.length === 0) {
        customerTableBody.innerHTML =
            `<tr><td colspan="6">No customers found</td></tr>`;
        return;
    }

    customerList.forEach(customer => {

        const row = document.createElement("tr");

        const values = [
            customer.id,
            customer.fullName,
            customer.email,
            customer.phone || "-",
            customer.address || "-"
        ];

        values.forEach(value => {
            const cell = document.createElement("td");
            cell.textContent = value ?? "-";
            row.appendChild(cell);
        });

        const actionsCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "action-btn edit-btn";
        editButton.addEventListener("click", () => editCustomer(customer.id));

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "action-btn delete-btn";
        deleteButton.addEventListener("click", () => deleteCustomer(customer.id));

        actionsCell.append(editButton, deleteButton);
        row.appendChild(actionsCell);

        customerTableBody.appendChild(row);
    });
}

customerForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const customerId = document.getElementById("customerId").value;

    const customerData = {
        fullName: document.getElementById("fullName").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        address: document.getElementById("address").value.trim()
    };

    const url = customerId
        ? `${API_URL}/${customerId}`
        : API_URL;

    const method = customerId ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(customerData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Unable to save customer");
        }

        showMessage(
            customerId
                ? "Customer updated successfully!"
                : "Customer added successfully!",
            "success"
        );

        resetForm();
        await loadCustomers();

    } catch (error) {
        showMessage(error.message, "error");
    }
});

function editCustomer(id) {

    const customer = customers.find(c => c.id === id);

    if (!customer) {
        return;
    }

    document.getElementById("customerId").value = customer.id;
    document.getElementById("fullName").value = customer.fullName;
    document.getElementById("email").value = customer.email;
    document.getElementById("phone").value = customer.phone || "";
    document.getElementById("address").value = customer.address || "";

    document.getElementById("formTitle").textContent = "Edit Customer";
    document.getElementById("submitBtn").textContent = "Update Customer";
    document.getElementById("cancelBtn").hidden = false;

    window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deleteCustomer(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this customer?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || "Unable to delete customer");
        }

        showMessage("Customer deleted successfully!", "success");
        await loadCustomers();

    } catch (error) {
        showMessage(error.message, "error");
    }
}

function resetForm() {

    customerForm.reset();

    document.getElementById("customerId").value = "";
    document.getElementById("formTitle").textContent = "Add New Customer";
    document.getElementById("submitBtn").textContent = "Add Customer";
    document.getElementById("cancelBtn").hidden = true;
}

function showMessage(message, type) {

    const messageElement = document.getElementById("customerMessage");

    messageElement.textContent = message;
    messageElement.style.color =
        type === "success" ? "#4ade80" : "#ff6b6b";
}

document.getElementById("cancelBtn").addEventListener("click", resetForm);

document.getElementById("searchCustomer").addEventListener("input", function() {

    const searchText = this.value.toLowerCase();

    const filteredCustomers = customers.filter(customer =>
        (customer.fullName || "").toLowerCase().includes(searchText) ||
        (customer.email || "").toLowerCase().includes(searchText) ||
        (customer.phone || "").toLowerCase().includes(searchText)
    );

    displayCustomers(filteredCustomers);
});

loadCustomers();