# MediBook Clinic Appointment System

**Student:** Murengezi Gisanura DaVinci

## 1. Setup Instructions

### Prerequisites
- Node.js (v18+)
- MySQL Server (v8.0+)
- Redis (Memurai, Docker, or WSL)

### Installation
1. Clone the repository and install dependencies:
   ```bash
   npm install
Create a .env file in the root directory (use .env.example as a template):

env
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=medibook
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
Build the database:

bash
# Run schema.sql and seed.sql in MySQL Workbench or via command line
mysql -u root -p < database/schema.sql
mysql -u root -p medibook < database/seed.sql
Running the Application
You need three terminal windows:

Web Server:

bash
npm start
Background Worker (for Waitlist & Notifications):

bash
npm run worker
Run Tests:

bash
npm test
## 2. Design Justifications
# Part C: Concurrency & Double-Booking Prevention
To ensure a doctor cannot have two appointments at the same time (even if two requests arrive simultaneously), I used two layers of defense:

# Database-level: The appointments table has a generated column active_slot_key (e.g., 1-202612010700). It generates a unique string only when the status is 'booked'. A UNIQUE constraint on this column prevents any double-booking at the database level. Cancelled appointments get a NULL key, allowing the slot to be rebooked while keeping the cancellation record.

# Application-level: The bookAppointment service uses a transaction with SELECT ... FOR UPDATE to lock the doctor's daily rows. This prevents the "12 appointments per day" race condition.

# Part C: Refund Policy Boundaries
The refund calculator strictly enforces the documented policy:

> 48 hours: 100%

24h to 48h (inclusive): 50%

< 24 hours: 0%
The tests in tests/refund.test.js explicitly cover the exact boundaries (exactly 24h and exactly 48h).

# Part D: Audit Logging
I used fs.promises.appendFile to log successful bookings and cancellations asynchronously. The logger automatically creates the logs/ directory if it doesn't exist. If the logging fails (e.g., permissions error), the error is caught and swallowed so the user's request never fails because of a logging issue.

# Part E: Redis Waitlist & Worker Process
When a slot is booked (409 Conflict), the patient is pushed to a Redis list specific to that doctor and timeslot (waitlist:{doctor_id}:{isoSlot}).
A separate worker process (worker/waitlistWorker.js) listens via BullMQ for cancellations. When a cancellation occurs, it pops the first patient from the list and tries to book them. If the booking fails (e.g., another non-waitlisted user booked the slot 1 second prior), the worker catches the error and pushes the patient back to the front of the Redis queue (requeue), ensuring they are never lost from both the queue and the database.

## 3. API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/patients` | List all patients |
| POST | `/api/patients` | Create a patient |
| GET | `/api/patients/:id` | Get patient by ID |
| PUT | `/api/patients/:id` | Update patient |
| DELETE | `/api/patients/:id` | Delete patient |
| GET | `/api/doctors` | List all doctors |
| POST | `/api/doctors` | Create a doctor |
| GET | `/api/doctors/:id` | Get doctor by ID |
| PUT | `/api/doctors/:id` | Update doctor |
| DELETE | `/api/doctors/:id` | Delete doctor |
| POST | `/api/appointments` | Book an appointment |
| DELETE | `/api/appointments/:id` | Cancel an appointment |
| GET | `/api/reports/doctors` | Doctors report (revenue/appts) |
| GET | `/api/reports/busy-days` | Busy days report (>80% capacity) |
| GET | `/api/reports/doctor/:id/stats` | Doctor statistics & utilization |
| GET | `/feedback?lang=[en/fr]` | i18n Feedback Page |

## 4. Database Schema
https://./schema-diagram.png
