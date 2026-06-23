\# PrimeHeal Database



This folder contains the MySQL database schema, sample data, and documentation for the PrimeHeal Health Support System.



\## Files



\- `schema/primeheal\_schema\_full.sql` — Complete database export including all tables, sample data, stored procedures, and triggers.



\## How to Set Up Locally



1\. Install MySQL Server 8.0+ and MySQL Workbench

2\. Create a new database:

```sql

&#x20;  CREATE DATABASE primeheal\_db;

```

3\. Import the schema file:



4\. Verify tables were created:

```sql

&#x20;  USE primeheal\_db;

&#x20;  SHOW TABLES;

```

&#x20;  You should see 15 tables.



\## Database Structure



15 tables covering:

\- User management (Users, Patient, Doctor, Receptionist, Accountant, Admin)

\- Appointments and scheduling (Appointment, DoctorAvailability)

\- Billing (Invoice, Payment)

\- Feedback and communication (Feedback, Notification, Complaint)

\- Medical records (MedicalReport)

\- System configuration (SystemSettings)



Includes 3 stored procedures and 2 triggers for business logic automation.



\## Database Administrator



R.M.V.S. Rathnayake (FC213007)

