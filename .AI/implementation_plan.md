# PrimeHeal — Database-to-Frontend Integration Plan

> **Created:** 2026-07-01  
> **Status:** Approved  
> **Backend:** Express.js + MySQL2  
> **Approach:** Phased implementation  
> **Source of truth:** Database records (not hardcoded frontend mock data)

---

## 1. Problem Statement

The PrimeHeal project has a fully defined MySQL database schema with **13 tables** containing real seed data, but **both the `frontend` and `admin` apps use entirely hardcoded mock data** — no backend exists. This plan maps every table to every component and defines how to wire them together through an Express.js API.

---

## 2. Current State: Gap Analysis

> ⚠️ **Both applications have ZERO database connectivity.** All data is hardcoded in React context providers or local component state. There is no backend server.

| Layer | Current State |
|---|---|
| **Database** | Full MySQL schema with 13 tables, FK relationships, indexes, and seed data |
| **Backend** | ❌ **Does not exist** — no `/backend` directory, no API server |
| **Frontend** | Hardcoded doctors list from `assets.js`; appointments in `localStorage`; user profile is static state |
| **Admin** | Hardcoded doctors, appointments, receptionists, accountants in `admin/src/context/AppContext.jsx`; auth uses mock tokens |

---

## 3. Decisions (Resolved)

| Question | Decision |
|---|---|
| Backend framework | **Express.js** with `mysql2` |
| Implementation order | **Phased approach** (4 phases) |
| Missing `gender` column in patient table | **Add via DB migration** |
| Image storage for doctors | **Deferred** — user will add images later. Use placeholder/null for now |
| Doctor data mismatch (hardcoded vs DB) | **Database records are source of truth.** Remove all hardcoded mock data |

---

## 4. Database Schema Summary (13 Tables)

### Entity Relationship Diagram

```
users (PK: userID)
 ├── 1:1 → patient    (FK: userID)
 ├── 1:1 → doctor     (FK: userID)
 ├── 1:1 → receptionist (FK: userID)
 ├── 1:1 → accountant (FK: userID)
 ├── 1:1 → admin      (FK: userID)
 ├── 1:N → complaint   (FK: userID)
 └── 1:N → notification (FK: userID)

patient (PK: patientID)
 └── 1:N → appointment (FK: patientID)

doctor (PK: doctorID)
 ├── 1:N → appointment (FK: doctorID)
 ├── 1:N → doctoravailability (FK: doctorID)
 ├── 1:N → feedback (FK: doctorID)
 └── 1:N → medicalreport (FK: doctorID)

appointment (PK: appointmentID)
 ├── 1:1 → invoice (FK: appointmentID)
 ├── 1:1 → feedback (FK: appointmentID)
 ├── 1:1 → medicalreport (FK: appointmentID)
 ├── 1:N → notification (FK: appointmentID)
 └── N:1 → receptionist (FK: receptionistID)

invoice (PK: invoiceID)
 └── 1:1 → payment (FK: invoiceID)

payment
 └── N:1 → accountant (FK: accountantID)

complaint
 └── N:1 → admin (FK: assignedToAdminID)

systemsettings
 └── N:1 → admin (FK: updatedByAdminID)
```

---

## 5. DB Migrations Required

### Migration 001: Add `gender` to `patient` table

```sql
ALTER TABLE `patient`
  ADD COLUMN `gender` ENUM('Male', 'Female', 'Other') DEFAULT NULL
  AFTER `dateOfBirth`;
```

### Migration 002: Add `profileImage` placeholder to `users` table (optional, for future)

```sql
ALTER TABLE `users`
  ADD COLUMN `profileImage` VARCHAR(255) DEFAULT NULL
  AFTER `phone`;
```

> Note: Image upload implementation is deferred. The column is added now for schema readiness.

---

## 6. Table → Component Mapping (Complete)

---

### TABLE: `users`

| Column | Type |
|---|---|
| userID | int PK AUTO_INCREMENT |
| name | varchar(100) NOT NULL |
| email | varchar(100) UNIQUE |
| password | varchar(255) |
| phone | varchar(20) |
| userType | enum('patient','doctor','receptionist','accountant','admin') |
| isActive | tinyint DEFAULT 1 |
| createdAt / updatedAt | timestamp |

#### Frontend Components:

| Component | File | Usage | Current State |
|---|---|---|---|
| **Login** | `frontend/src/pages/Login.jsx` | POST `email`+`password` → authenticate, get JWT. SignUp: POST `name`,`email`,`password` → create user (type='patient') | ❌ Simulated `setToken(true)` |
| **Navbar** | `frontend/src/components/Navbar.jsx` | Display logged-in user `name`, avatar | ❌ Hardcoded "Kasun Dilanka" |
| **MyProfile** | `frontend/src/pages/MyProfile.jsx` | GET/PUT `name`, `email`, `phone` | ❌ Hardcoded "Edward Vincent" |
| **AppContext** | `frontend/src/context/AppContext.jsx` | Store JWT token, user object | ❌ Boolean `token` only |

#### Admin Components:

| Component | File | Usage | Current State |
|---|---|---|---|
| **Login** | `admin/src/pages/Login.jsx` | Authenticate all roles | ❌ Hardcoded credentials |
| **AdminContext** | `admin/src/context/AdminContext.jsx` | Admin token management | ❌ Mock token |
| **DoctorContext** | `admin/src/context/DoctorContext.jsx` | Doctor login by email | ❌ Checks hardcoded array |

---

### TABLE: `patient`

| Column | Type |
|---|---|
| patientID | int PK AUTO_INCREMENT |
| title | varchar(10) |
| userID | int FK → users |
| dateOfBirth | date |
| gender | enum (NEW — via migration) |
| address | text |
| emergencyContact | varchar(20) |
| allergies | text |
| nic | varchar(20) UNIQUE |
| country | varchar(50) DEFAULT 'Sri Lanka' |
| patientCode | varchar(20) UNIQUE |

#### Frontend Components:

| Component | File | Usage | Current State |
|---|---|---|---|
| **Login** (Sign Up) | `frontend/src/pages/Login.jsx` | Create patient record with `dob`, `address`, `emergencyContact`, `allergies` | ❌ Fields exist, no API |
| **MyProfile** | `frontend/src/pages/MyProfile.jsx` | Display/edit `dateOfBirth`, `address`, `gender` | ❌ Hardcoded static |
| **Appointment** (booking modal) | `frontend/src/pages/Appointment.jsx` | Auto-populate `title`, `name`, `phone`, `nic`, `email`, `address`, `country` from logged-in patient | ❌ Blank form → localStorage |
| **MyAppointments** | `frontend/src/pages/MyAppointments.jsx` | Show patient details per appointment | ❌ Reads localStorage |

#### Admin Components:

| Component | File | Usage | Current State |
|---|---|---|---|
| **AllAppointments** | `admin/src/pages/Admin/AllAppointments.jsx` | Patient name, phone, age (from DOB) | ❌ Mock `patientDob` |
| **DoctorAppointments** | `admin/src/pages/Doctor/DoctorAppointments.jsx` | Patient name, phone, email, age | ❌ Mock data |
| **ReceptionistDashboard** | `admin/src/pages/Receptionist/ReceptionistDashboard.jsx` | Patient info, booking form | ❌ Mock data |

---

### TABLE: `doctor`

| Column | Type |
|---|---|
| doctorID | int PK AUTO_INCREMENT |
| userID | int FK → users |
| specialization | varchar(100) |
| licenseNumber | varchar(50) UNIQUE |
| qualifications | text |
| bio | text |
| consultationFee | decimal(10,2) |
| averageRating | decimal(3,2) |
| totalPatients | int |
| isAvailable | tinyint DEFAULT 1 |

#### Frontend Components:

| Component | File | Usage | Current State |
|---|---|---|---|
| **TopDoctors** | `frontend/src/components/TopDoctors.jsx` | GET top doctors by speciality. Needs: `name` (from users), `specialization`, `consultationFee`, `isAvailable` | ❌ Hardcoded array |
| **Doctors** | `frontend/src/pages/Doctors.jsx` | GET all doctors, filter by speciality | ❌ Hardcoded array |
| **Appointment** | `frontend/src/pages/Appointment.jsx` | GET single doctor: `name`, `specialization`, `qualifications`, `bio`, `consultationFee` | ❌ `doctors.find()` on hardcoded |
| **RelatedDoctors** | `frontend/src/components/RelatedDoctors.jsx` | GET doctors same speciality, exclude current | ❌ Filters hardcoded |
| **Navbar** | `frontend/src/components/Navbar.jsx` | Search by name/speciality | ❌ Filters hardcoded |
| **SpecialityMenu** | `frontend/src/components/SpecialityMenu.jsx` | List unique specialities (can derive from doctor table) | ❌ Static `specialityData` array |

#### Admin Components:

| Component | File | Usage | Current State |
|---|---|---|---|
| **AddDoctor** | `admin/src/pages/Admin/AddDoctor.jsx` | POST new doctor (creates users + doctor records) | ❌ Appends to in-memory |
| **DoctorsList** | `admin/src/pages/Admin/DoctorsList.jsx` | GET all, toggle `isAvailable` | ❌ In-memory |
| **Dashboard** | `admin/src/pages/Admin/Dashboard.jsx` | Doctor lookup per appointment | ❌ In-memory |
| **DoctorProfile** | `admin/src/pages/Doctor/DoctorProfile.jsx` | GET/PUT own profile (about, fees, available, address) | ❌ In-memory |
| **DoctorDashboard** | `admin/src/pages/Doctor/DoctorDashboard.jsx` | GET current doctor name, stats | ❌ In-memory |

---

### TABLE: `appointment`

| Column | Type |
|---|---|
| appointmentID | int PK AUTO_INCREMENT |
| patientID | int FK → patient |
| doctorID | int FK → doctor |
| receptionistID | int FK → receptionist (nullable) |
| appointmentDate | date |
| appointmentTime | time |
| duration | int DEFAULT 30 |
| consultationFee | decimal(10,2) |
| status | enum('pending','confirmed','checked-in','completed','cancelled','no-show') |
| reason | text |
| doctorNotes | text |
| noShowRefund | tinyint |
| noShowSurcharge | decimal(10,2) |
| checkedIn | tinyint |
| checkedInTime | timestamp |
| createdAt / updatedAt | timestamp |

#### Frontend Components:

| Component | File | Usage | Current State |
|---|---|---|---|
| **Appointment** | `frontend/src/pages/Appointment.jsx` | POST new appointment | ❌ Saves to localStorage |
| **MyAppointments** | `frontend/src/pages/MyAppointments.jsx` | GET patient's appointments (joined with doctor). Cancel. Pay | ❌ Reads localStorage |
| **TopDoctors** | `frontend/src/components/TopDoctors.jsx` | Count appointments per doctor for ranking | ❌ Counts localStorage |

#### Admin Components:

| Component | File | Usage | Current State |
|---|---|---|---|
| **Dashboard** | `admin/src/pages/Admin/Dashboard.jsx` | GET all → earnings, count, patients. 5 latest. Complete/Cancel | ❌ In-memory |
| **AllAppointments** | `admin/src/pages/Admin/AllAppointments.jsx` | GET all with patient+doctor joins. Complete/Cancel | ❌ In-memory |
| **DoctorDashboard** | `admin/src/pages/Doctor/DoctorDashboard.jsx` | GET own appointments, today's stats | ❌ In-memory filter |
| **DoctorAppointments** | `admin/src/pages/Doctor/DoctorAppointments.jsx` | GET own appointments, status changes | ❌ In-memory filter |
| **ReceptionistDashboard** | `admin/src/pages/Receptionist/ReceptionistDashboard.jsx` | GET all. Check-in/Cancel/Complete. POST new | ❌ In-memory |
| **AccountantDashboard** | `admin/src/pages/Accountant/AccountantDashboard.jsx` | GET all → revenue, invoices, outstanding. Mark paid/refund | ❌ In-memory |

---

### TABLE: `doctoravailability`

| Column | Type |
|---|---|
| availabilityID | int PK AUTO_INCREMENT |
| doctorID | int FK → doctor |
| dayOfWeek | enum('Monday'...'Sunday') |
| startTime / endTime | time |
| slotDuration | int DEFAULT 30 |
| maxAppointmentsPerSlot | int DEFAULT 1 |
| recurring | tinyint DEFAULT 1 |
| specificDate | date |
| isActive | tinyint DEFAULT 1 |

#### Frontend Components:

| Component | File | Usage | Current State |
|---|---|---|---|
| **Appointment** | `frontend/src/pages/Appointment.jsx` | GET available slots for doctor on date. Must compute real slots from availability data | ❌ Generates static 30-min from 10:00-21:00 |

#### Admin Components:

| Component | File | Usage | Current State |
|---|---|---|---|
| **DoctorSchedule** | `admin/src/pages/Doctor/DoctorSchedule.jsx` | GET/PUT schedule. Toggle slots. Apply range | ❌ Mock `doctorSchedules` array |

---

### TABLE: `feedback`

| Column | Type |
|---|---|
| feedbackID | int PK AUTO_INCREMENT |
| appointmentID | int FK → appointment |
| patientID | int FK → patient |
| doctorID | int FK → doctor |
| rating | int (1-5) CHECK |
| comments | text |
| createdAt | timestamp |
| isVisible / isApproved | tinyint |

#### Frontend Components (NOT IMPLEMENTED YET):

| Component | File | Needed Feature |
|---|---|---|
| **Appointment** | `frontend/src/pages/Appointment.jsx` | Show doctor's average rating + recent reviews |
| **Doctors** | `frontend/src/pages/Doctors.jsx` | Rating badge on doctor cards |
| **MyAppointments** | `frontend/src/pages/MyAppointments.jsx` | Submit feedback form for completed appointments |

#### Admin Components (NOT IMPLEMENTED YET):

| Component | File | Needed Feature |
|---|---|---|
| **DoctorDashboard** | `admin/src/pages/Doctor/DoctorDashboard.jsx` | Show avg rating, recent feedback |
| **DoctorProfile** | `admin/src/pages/Doctor/DoctorProfile.jsx` | Display averageRating |
| **Dashboard** | `admin/src/pages/Admin/Dashboard.jsx` | Feedback moderation queue |

---

### TABLE: `invoice`

| Column | Type |
|---|---|
| invoiceID | int PK AUTO_INCREMENT |
| appointmentID | int FK → appointment |
| patientID | int FK → patient |
| invoiceNumber | varchar(50) UNIQUE |
| subtotal / tax / discount / totalAmount | decimal(10,2) |
| issueDate / dueDate | date |
| status | enum('draft','issued','paid','overdue','cancelled') |

#### Frontend Components:

| Component | File | Usage | Current State |
|---|---|---|---|
| **MyAppointments** | `frontend/src/pages/MyAppointments.jsx` | Payment modal fee breakdown. Should GET real invoice | ❌ Hardcoded $20 tax, $4.10 services |

#### Admin Components:

| Component | File | Usage | Current State |
|---|---|---|---|
| **AccountantDashboard** | `admin/src/pages/Accountant/AccountantDashboard.jsx` | All invoices, mark paid, refund, totals | ❌ Uses appointment `amount` only |

---

### TABLE: `payment`

| Column | Type |
|---|---|
| paymentID | int PK AUTO_INCREMENT |
| appointmentID / invoiceID / accountantID | int FK |
| amount / refundAmount | decimal(10,2) |
| paymentMethod | enum('cash','card','online','insurance') |
| paymentDate | timestamp |
| status | enum('pending','processing','completed','failed','refunded') |
| transactionID | varchar(100) |
| paymentGatewayResponse | text |

#### Frontend Components:

| Component | File | Usage | Current State |
|---|---|---|---|
| **MyAppointments** | `frontend/src/pages/MyAppointments.jsx` | POST payment (amount, method) → create payment record | ❌ Simulated 1.5s timeout |

#### Admin Components:

| Component | File | Usage | Current State |
|---|---|---|---|
| **AccountantDashboard** | `admin/src/pages/Accountant/AccountantDashboard.jsx` | Payment tracking, mark paid, refund | ❌ Only changes appointment status |

---

### TABLE: `medicalreport`

| Column | Type |
|---|---|
| reportID | int PK AUTO_INCREMENT |
| appointmentID / patientID / doctorID | int FK |
| reportType | varchar(100) |
| diagnosis / prescription / labResults | text |
| reportDate | date |
| fileURL | varchar(255) |

#### Frontend Components (NOT IMPLEMENTED YET):

| Component | File | Needed Feature |
|---|---|---|
| **MyAppointments** | `frontend/src/pages/MyAppointments.jsx` | View/download reports for completed appointments |

#### Admin Components (NOT IMPLEMENTED YET):

| Component | File | Needed Feature |
|---|---|---|
| **DoctorAppointments** | `admin/src/pages/Doctor/DoctorAppointments.jsx` | Create report (diagnosis, prescription) per appointment |

---

### TABLE: `notification`

| Column | Type |
|---|---|
| notificationID | int PK AUTO_INCREMENT |
| userID / appointmentID | int FK |
| message | text |
| notificationType | enum('email','sms','system') |
| status | enum('pending','sent','failed','read') |
| recipientEmail | varchar(100) |
| retryCount | int |

#### Frontend Components (NOT IMPLEMENTED YET):

| Component | File | Needed Feature |
|---|---|---|
| **Navbar** | `frontend/src/components/Navbar.jsx` | Notification bell with unread count |

#### Admin Components (NOT IMPLEMENTED YET):

All admin pages — notification system for staff roles.

---

### TABLE: `complaint`

| Column | Type |
|---|---|
| complaintID | int PK AUTO_INCREMENT |
| userID / assignedToAdminID | int FK |
| complaintType | enum('service','billing','technical','staff','other') |
| description / resolution | text |
| status | enum('open','in-progress','resolved','closed') |
| createdAt / resolvedAt | timestamp |

#### Frontend Components (NOT IMPLEMENTED YET):

| Component | File | Needed Feature |
|---|---|---|
| **Contact** | `frontend/src/pages/Contact.jsx` | Complaint submission form |

#### Admin Components (NOT IMPLEMENTED YET):

| Component | File | Needed Feature |
|---|---|---|
| **Dashboard** | `admin/src/pages/Admin/Dashboard.jsx` | Complaints queue for admin |

---

### TABLE: `receptionist`

| Column | Type |
|---|---|
| receptionistID | int PK AUTO_INCREMENT |
| userID | int FK → users |
| shiftTime | varchar(50) |
| department | varchar(100) |

#### Admin Components:

| Component | File | Usage | Current State |
|---|---|---|---|
| **Receptionist** | `admin/src/pages/Admin/Receptionist.jsx` | CRUD receptionists, toggle availability, search | ❌ In-memory mock |
| **ReceptionistDashboard** | `admin/src/pages/Receptionist/ReceptionistDashboard.jsx` | Current receptionist identity | ❌ Mock token |

---

### TABLE: `accountant`

| Column | Type |
|---|---|
| accountantID | int PK AUTO_INCREMENT |
| userID | int FK → users |
| accountingLicense | varchar(50) |
| department | varchar(100) |

#### Admin Components:

| Component | File | Usage | Current State |
|---|---|---|---|
| **Accountant** | `admin/src/pages/Admin/Accountant.jsx` | CRUD accountants, toggle availability, search | ❌ In-memory mock |
| **AccountantDashboard** | `admin/src/pages/Accountant/AccountantDashboard.jsx` | Current accountant identity | ❌ Mock token |

---

### TABLE: `admin`

| Column | Type |
|---|---|
| adminID | int PK AUTO_INCREMENT |
| userID | int FK → users |
| permissions | JSON |
| accessLevel | enum('super','standard','limited') |

#### Admin Components:

| Component | File | Usage | Current State |
|---|---|---|---|
| **AdminContext** | `admin/src/context/AdminContext.jsx` | Auth, permissions | ❌ Hardcoded check |

---

### TABLE: `systemsettings`

| Column | Type |
|---|---|
| settingID | int PK AUTO_INCREMENT |
| settingName | varchar(100) UNIQUE |
| settingValue | text |
| category | varchar(50) |
| description | text |
| updatedByAdminID | int FK |

#### Admin Components (NOT IMPLEMENTED YET):

| Component | File | Needed Feature |
|---|---|---|
| **Dashboard** / new Settings page | `admin/src/pages/Admin/` | Manage configurable values (slot duration, tax rates, cancellation hours) |

---

## 7. Implementation Phases

### Phase 1: Backend Foundation + Auth + Users + Doctors
**Goal:** Enable login, doctor browsing, doctor management  
**Estimated scope:** Backend setup, 6 API route files, 3 context rewrites

#### New Files:
```
backend/
├── server.js
├── package.json
├── .env
├── config/
│   └── db.js                         # MySQL2 pool
├── middleware/
│   ├── auth.js                        # JWT verify
│   └── roleGuard.js                   # Role-based access
├── routes/
│   ├── authRoutes.js                  # POST /api/auth/login, /api/auth/register
│   ├── userRoutes.js                  # GET/PUT /api/users/profile
│   └── doctorRoutes.js                # GET /api/doctors, GET /api/doctors/:id, POST, PUT
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   └── doctorController.js
└── migrations/
    └── 001_add_gender_to_patient.sql
```

#### Modified Files:

**Frontend:**
- `frontend/src/context/AppContext.jsx` — Add `backendUrl`, JWT storage, `fetchDoctors()`, remove hardcoded `doctors` import
- `frontend/src/pages/Login.jsx` — Replace `setToken(true)` with real API call
- `frontend/src/pages/Doctors.jsx` — Fetch from API
- `frontend/src/pages/Appointment.jsx` — Fetch doctor by ID from API
- `frontend/src/pages/MyProfile.jsx` — GET/PUT profile from API
- `frontend/src/components/TopDoctors.jsx` — Fetch from API
- `frontend/src/components/RelatedDoctors.jsx` — Fetch from API
- `frontend/src/components/Navbar.jsx` — Search against API data, display real user name
- `frontend/src/components/SpecialityMenu.jsx` — Derive specialities from API

**Admin:**
- `admin/src/context/AppContext.jsx` — Remove 250+ lines of hardcoded data, add API fetches
- `admin/src/context/AdminContext.jsx` — Real JWT login
- `admin/src/context/DoctorContext.jsx` — Real JWT login
- `admin/src/pages/Login.jsx` — Real API auth
- `admin/src/pages/Admin/AddDoctor.jsx` — POST to API
- `admin/src/pages/Admin/DoctorsList.jsx` — GET from API, PUT availability
- `admin/src/pages/Doctor/DoctorProfile.jsx` — GET/PUT from API

**New service files:**
- `frontend/src/services/api.js` — Axios instance + auth functions
- `admin/src/services/api.js` — Axios instance + admin auth functions

---

### Phase 2: Appointments + Availability
**Goal:** Enable end-to-end booking flow  

#### New Files:
```
backend/routes/appointmentRoutes.js
backend/routes/availabilityRoutes.js
backend/controllers/appointmentController.js
backend/controllers/availabilityController.js
```

#### API Endpoints:
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/appointments` | All appointments (admin/receptionist) |
| GET | `/api/appointments/my` | Patient's appointments |
| GET | `/api/appointments/doctor/:id` | Doctor's appointments |
| POST | `/api/appointments` | Create appointment |
| PUT | `/api/appointments/:id` | Update status (cancel, check-in, complete) |
| GET | `/api/doctors/:id/availability` | Get availability slots |
| PUT | `/api/doctors/:id/availability` | Update availability |

#### Modified Files:
- `frontend/src/pages/Appointment.jsx` — Real slot computation + POST booking
- `frontend/src/pages/MyAppointments.jsx` — GET from API, cancel via API
- `frontend/src/components/TopDoctors.jsx` — Use API appointment counts
- `admin/src/pages/Admin/Dashboard.jsx` — Fetch real data
- `admin/src/pages/Admin/AllAppointments.jsx` — Fetch real data
- `admin/src/pages/Doctor/DoctorDashboard.jsx` — Fetch real data
- `admin/src/pages/Doctor/DoctorAppointments.jsx` — Fetch real data
- `admin/src/pages/Doctor/DoctorSchedule.jsx` — Real availability API
- `admin/src/pages/Receptionist/ReceptionistDashboard.jsx` — Real data + booking

---

### Phase 3: Invoices + Payments + Feedback
**Goal:** Enable financial flow and review system

#### New Files:
```
backend/routes/invoiceRoutes.js
backend/routes/paymentRoutes.js
backend/routes/feedbackRoutes.js
backend/controllers/invoiceController.js
backend/controllers/paymentController.js
backend/controllers/feedbackController.js
```

#### API Endpoints:
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/invoices/:appointmentId` | Get invoice for appointment |
| POST | `/api/invoices` | Auto-created with appointment |
| PUT | `/api/invoices/:id` | Update status |
| POST | `/api/payments` | Process payment |
| GET | `/api/payments` | All payments (accountant) |
| GET | `/api/feedback/doctor/:id` | Doctor's feedback + avg rating |
| POST | `/api/feedback` | Submit feedback |

#### Modified Files:
- `frontend/src/pages/MyAppointments.jsx` — Real payment flow, feedback submission
- `frontend/src/pages/Doctors.jsx` — Show ratings
- `frontend/src/pages/Appointment.jsx` — Show doctor rating
- `admin/src/pages/Accountant/AccountantDashboard.jsx` — Real financial data
- `admin/src/pages/Doctor/DoctorDashboard.jsx` — Show rating
- `admin/src/pages/Doctor/DoctorProfile.jsx` — Show rating

---

### Phase 4: Reports + Notifications + Complaints + Settings + Staff Management
**Goal:** Complete remaining features

#### New Files:
```
backend/routes/reportRoutes.js
backend/routes/notificationRoutes.js
backend/routes/complaintRoutes.js
backend/routes/receptionistRoutes.js
backend/routes/accountantRoutes.js
backend/routes/settingsRoutes.js
backend/controllers/(one per route)
```

#### API Endpoints:
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reports/patient/:id` | Patient's medical reports |
| POST | `/api/reports` | Doctor creates report |
| GET | `/api/notifications` | User's notifications |
| PUT | `/api/notifications/:id/read` | Mark as read |
| POST | `/api/complaints` | Submit complaint |
| GET | `/api/complaints` | Admin view complaints |
| PUT | `/api/complaints/:id` | Resolve complaint |
| CRUD | `/api/receptionists` | Manage receptionists |
| CRUD | `/api/accountants` | Manage accountants |
| GET/PUT | `/api/settings` | System settings |

#### Modified Files:
- `frontend/src/pages/MyAppointments.jsx` — View/download reports
- `frontend/src/components/Navbar.jsx` — Notification bell
- `frontend/src/pages/Contact.jsx` — Complaint form
- `admin/src/pages/Admin/Dashboard.jsx` — Complaints queue
- `admin/src/pages/Admin/Receptionist.jsx` — Real CRUD
- `admin/src/pages/Admin/Accountant.jsx` — Real CRUD
- `admin/src/pages/Doctor/DoctorAppointments.jsx` — Create reports
- New: `admin/src/pages/Admin/Settings.jsx` — System settings page

---

## 8. Backend Architecture Detail

### Directory Structure
```
backend/
├── server.js                          # Express entry point, CORS, JSON parsing
├── package.json                       # express, mysql2, bcryptjs, jsonwebtoken, cors, dotenv, multer
├── .env                               # DB_HOST, DB_USER, DB_PASS, DB_NAME, JWT_SECRET, PORT
├── config/
│   └── db.js                          # mysql2 createPool with promise wrapper
├── middleware/
│   ├── auth.js                        # verifyToken: extract JWT from Authorization header
│   └── roleGuard.js                   # requireRole('admin','doctor',...): check userType
├── migrations/
│   ├── 001_add_gender_to_patient.sql
│   └── 002_add_profileImage_to_users.sql
├── routes/
│   ├── authRoutes.js
│   ├── userRoutes.js
│   ├── doctorRoutes.js
│   ├── appointmentRoutes.js
│   ├── availabilityRoutes.js
│   ├── feedbackRoutes.js
│   ├── invoiceRoutes.js
│   ├── paymentRoutes.js
│   ├── reportRoutes.js
│   ├── notificationRoutes.js
│   ├── complaintRoutes.js
│   ├── receptionistRoutes.js
│   ├── accountantRoutes.js
│   └── settingsRoutes.js
└── controllers/
    ├── authController.js              # login (bcrypt compare, JWT sign), register
    ├── userController.js              # getProfile, updateProfile
    ├── doctorController.js            # getAll, getById, create, update, toggleAvailability
    ├── appointmentController.js       # CRUD + status transitions
    ├── availabilityController.js      # getForDoctor, update
    ├── feedbackController.js          # create, getByDoctor
    ├── invoiceController.js           # getByAppointment, updateStatus
    ├── paymentController.js           # create, getAll
    ├── reportController.js            # create, getByPatient
    ├── notificationController.js      # getForUser, markRead
    ├── complaintController.js         # create, getAll, resolve
    ├── receptionistController.js      # CRUD
    ├── accountantController.js        # CRUD
    └── settingsController.js          # getAll, update
```

### Key Design Decisions:
- **Authentication:** JWT tokens with `userType` embedded in payload
- **Password hashing:** bcryptjs (compatible with existing `$2a$10$` hashes in DB)
- **DB connection:** mysql2/promise connection pool
- **CORS:** Allow `http://localhost:5173` (Vite frontend) and `http://localhost:5174` (Vite admin)
- **Error handling:** Centralized error middleware
- **Image uploads:** Deferred (user will add later)

---

## 9. Verification Plan

### Per-Phase Testing:

**Phase 1 — Auth + Doctors:**
- Register new patient → verify in DB
- Login → receive JWT → access protected routes
- GET /api/doctors → returns real DB doctors
- Frontend: Login → see real doctors → view doctor detail
- Admin: Login → see real doctor list → add doctor → verify in DB

**Phase 2 — Appointments:**
- Book appointment → verify in DB with correct FKs
- View appointments → correct joins (patient + doctor names)
- Cancel → status changes in DB
- Check-in → status changes in DB
- Slot availability → computed from `doctoravailability` table

**Phase 3 — Financial:**
- Booking auto-creates invoice
- Payment creates payment record + updates invoice status
- Accountant dashboard shows real revenue numbers
- Feedback submission → updates doctor `averageRating`

**Phase 4 — Remaining:**
- Medical report creation → accessible by patient
- Notifications created on appointment events
- Complaint submission + admin resolution flow
- Staff CRUD operations persist to DB

### Commands:
```bash
# Backend
cd backend && npm test

# Frontend
cd frontend && npm run dev    # Manual testing on localhost:5173

# Admin
cd admin && npm run dev       # Manual testing on localhost:5174
```

---

## 10. Risk Register

| Risk | Impact | Mitigation |
|---|---|---|
| Existing hardcoded data differs from DB schema (field names, structure) | High | Map fields carefully in controllers; document field name translations |
| Frontend uses `_id` (MongoDB style) but DB uses `doctorID`, `userID` etc. | Medium | API responses normalize to `_id` format OR update frontend to use DB column names |
| Authentication breaking during migration from mock → real | High | Implement API auth first, test thoroughly, then swap frontend in one commit |
| Loss of current UI functionality during migration | Medium | Phase approach ensures each phase is deployable; keep mock fallbacks until API is verified |
| `localStorage` appointment data orphaned after API migration | Low | Clear localStorage on first API-connected login; migrate if needed |
