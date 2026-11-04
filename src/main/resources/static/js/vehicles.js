
const vehicleForm = document.getElementById("vehicleForm");

document.addEventListener("DOMContentLoaded", loadVehicles);

// Load all vehicles
async function loadVehicles() {
    try {
        const response = await fetch("/api/vehicles");

        if (!response.ok) {
            throw new Error("Failed to load vehicles");
        }

        const vehicles = await response.json();

        document.getElementById("totalVehicles").textContent =
            vehicles.length;

        document.getElementById("availableVehicles").textContent =
            vehicles.filter(v => v.available).length;

        document.getElementById("unavailableVehicles").textContent =
            vehicles.filter(v => !v.available).length;

        const table = document.getElementById("vehicleTable");

        if (vehicles.length === 0) {
            table.innerHTML =
                '<tr><td colspan="9">No vehicles registered</td></tr>';
            return;
        }

        table.innerHTML = vehicles.map(vehicle => `
            <tr>
                <td>${vehicle.id}</td>
                <td>${vehicle.vehicleName}</td>
                <td>${vehicle.brand}</td>
                <td>${vehicle.model}</td>
                <td>${vehicle.registrationNumber}</td>
                <td>${vehicle.fuelType}</td>
                <td>₹${vehicle.pricePerDay}</td>
                <td>
                    <span class="status ${vehicle.available ? 'available' : 'unavailable'}">
                        ${vehicle.available ? 'Available' : 'Unavailable'}
                    </span>
                </td>
                <td>
                    <button class="action-button edit-button"
                        onclick="editVehicle(${vehicle.id})">
                        Edit
                    </button>

                    <button class="action-button delete-button"
                        onclick="deleteVehicle(${vehicle.id})">
                        Delete
                    </button>
                </td>
            </tr>
        `).join("");

    } catch (error) {
        console.error(error);

        document.getElementById("vehicleTable").innerHTML =
            '<tr><td colspan="9">Unable to load vehicles</td></tr>';
    }
}

// Add or update vehicle
vehicleForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const id = document.getElementById("vehicleId").value;

    const vehicle = {
        vehicleName: document.getElementById("vehicleName").value.trim(),
        brand: document.getElementById("brand").value.trim(),
        model: document.getElementById("model").value.trim(),
        registrationNumber: document.getElementById("registrationNumber").value.trim().toUpperCase(),
        fuelType: document.getElementById("fuelType").value,
        pricePerDay: Number(document.getElementById("pricePerDay").value)
    };

    const url = id ? `/api/vehicles/${id}` : "/api/vehicles";
    const method = id ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(vehicle)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || "Unable to save vehicle");
        }

        showMessage(
            id ? "Vehicle updated successfully!" : "Vehicle added successfully!",
            true
        );

        resetForm();
        await loadVehicles();

    } catch (error) {
        showMessage(error.message, false);
    }
});

// Edit vehicle
async function editVehicle(id) {
    try {
        const response = await fetch(`/api/vehicles/${id}`);

        if (!response.ok) {
            throw new Error("Unable to retrieve vehicle");
        }

        const vehicle = await response.json();

        document.getElementById("vehicleId").value = vehicle.id;
        document.getElementById("vehicleName").value = vehicle.vehicleName;
        document.getElementById("brand").value = vehicle.brand;
        document.getElementById("model").value = vehicle.model;
        document.getElementById("registrationNumber").value = vehicle.registrationNumber;
        document.getElementById("fuelType").value = vehicle.fuelType;
        document.getElementById("pricePerDay").value = vehicle.pricePerDay;

        document.getElementById("formTitle").textContent = "Edit Vehicle";
        document.getElementById("saveButton").textContent = "Update Vehicle";
        document.getElementById("cancelEditButton").style.display = "inline-block";

        document.getElementById("vehicleFormSection").scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {
        showMessage(error.message, false);
    }
}

// Delete vehicle
async function deleteVehicle(id) {
    if (!confirm("Are you sure you want to delete this vehicle?")) {
        return;
    }

    try {
        const response = await fetch(`/api/vehicles/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(error || "Unable to delete vehicle");
        }

        showMessage("Vehicle deleted successfully!", true);
        await loadVehicles();

    } catch (error) {
        showMessage(error.message, false);
    }
}

// Reset form
function resetForm() {
    vehicleForm.reset();

    document.getElementById("vehicleId").value = "";
    document.getElementById("formTitle").textContent = "Add New Vehicle";
    document.getElementById("saveButton").textContent = "Add Vehicle";
    document.getElementById("cancelEditButton").style.display = "none";
}

// Display messages
function showMessage(message, success) {
    const element = document.getElementById("formMessage");

    element.textContent = message;
    element.className = success
        ? "form-message success-message"
        : "form-message error-message";
}
