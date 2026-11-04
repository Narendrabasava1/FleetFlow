# FleetFlow – Vehicle Rental Management System

FleetFlow is a full-stack web application designed to simplify vehicle rental operations. It provides a centralized platform to manage vehicles, customers, bookings, and payments through an intuitive dashboard.

## Features

### 1. Dashboard
- Overview of total vehicles, customers, bookings, and payments.
- Booking and payment summaries.
- Quick navigation to management modules.

### 2. Vehicle Management
- Add new vehicles.
- View vehicle details.
- Update vehicle information.
- Delete vehicle records.
- Track vehicle availability.

### 3. Customer Management
- Register new customers.
- View and manage customer details.
- Update and delete customer records.
- Search customers.
- Validate customer information and prevent duplicate email addresses.

### 4. Booking Management
- Create vehicle bookings.
- Select customers and available vehicles.
- Choose pickup and return dates.
- Automatically calculate rental duration and total price.
- Prevent overlapping active bookings.
- Cancel bookings and view booking history.

### 5. Payment Management
- Create payments for confirmed bookings.
- Support CASH, UPI, and CARD payment methods.
- Track PENDING, SUCCESS, and FAILED payment statuses.
- View payment history and revenue summaries.

**Note:** Payments are simulated within the application. No external payment gateway is integrated.

## Technology Stack

| Category | Technologies |
|---|---|
| Backend | Java, Spring Boot |
| Frontend | HTML, CSS, JavaScript, Thymeleaf |
| Database | MySQL |
| ORM | Spring Data JPA, Hibernate |
| Build Tool | Maven |
| Development Environment | Eclipse IDE |

## Application Architecture

FleetFlow follows a layered architecture:

- **Controller Layer:** Handles HTTP requests and REST API endpoints.
- **Service Layer:** Contains business logic and validation.
- **Repository Layer:** Communicates with the MySQL database using Spring Data JPA.
- **Entity Layer:** Represents database entities.
- **Frontend Layer:** Provides the user interface using HTML, CSS, JavaScript and Thymeleaf.

## REST API Endpoints

### Vehicles

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/vehicles` | Add a vehicle |
| GET | `/api/vehicles` | Get all vehicles |
| GET | `/api/vehicles/{id}` | Get vehicle by ID |
| PUT | `/api/vehicles/{id}` | Update vehicle |
| DELETE | `/api/vehicles/{id}` | Delete vehicle |

### Customers

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/customers` | Add a customer |
| GET | `/api/customers` | Get all customers |
| GET | `/api/customers/{id}` | Get customer by ID |
| PUT | `/api/customers/{id}` | Update customer |
| DELETE | `/api/customers/{id}` | Delete customer |

### Bookings

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/bookings` | Create a booking |
| GET | `/api/bookings` | Get all bookings |
| GET | `/api/bookings/{id}` | Get booking by ID |
| PUT | `/api/bookings/{id}/cancel` | Cancel a booking |

### Payments

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/payments` | Create a payment |
| GET | `/api/payments` | Get all payments |
| GET | `/api/payments/{id}` | Get payment by ID |
| GET | `/api/payments/booking/{bookingId}` | Get payments by booking |
| PUT | `/api/payments/{id}/status` | Update payment status |

## Database Configuration

1. Install and start MySQL.
2. Create the database:

   `CREATE DATABASE fleetflow_db;`

3. Configure the following environment variables:

   - `DB_URL` – MySQL connection URL.
   - `DB_USERNAME` – MySQL username.
   - `DB_PASSWORD` – MySQL password.

Do not commit database passwords or other credentials to GitHub.

## Run Locally

1. Clone the repository:

   `git clone https://github.com/Narendrabasava1/FleetFlow.git`

2. Navigate into the project directory:

   `cd FleetFlow`

3. Configure your MySQL database and environment variables.

4. Run the application using Maven:

   `mvn spring-boot:run`

5. Open your browser:

   `http://localhost:8080`

## Future Enhancements

- User authentication and role-based access control.
- Integration with a real payment gateway.
- Email and booking notifications.
- Advanced reporting and analytics.
- Cloud deployment.

## Author

**Basava Narendra**

- GitHub: https://github.com/Narendrabasava1
- LinkedIn: https://www.linkedin.com/in/narendrabasava

---

*FleetFlow – Simplifying Vehicle Rental Management.*