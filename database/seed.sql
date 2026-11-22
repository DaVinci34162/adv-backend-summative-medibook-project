-- database/seed.sql
USE medibook;

-- Clean slate
DELETE FROM appointments;
DELETE FROM patients;
DELETE FROM doctors;
ALTER TABLE patients     AUTO_INCREMENT = 1;
ALTER TABLE doctors      AUTO_INCREMENT = 1;
ALTER TABLE appointments AUTO_INCREMENT = 1;

-- 3 patients
INSERT INTO patients (first_name, last_name, email, phone) VALUES
('Ama',  'Mensah', 'ama@mail.com',  '0244-111-222'),
('Kojo', 'Owusu',  'kojo@mail.com', '0555-333-444'),
('Akua', 'Boateng','akua@mail.com', '0277-555-666');

-- 3 doctors (Adjei intentionally has zero appointments)
INSERT INTO doctors (first_name, last_name, specialty, room, consultation_fee, email) VALUES
('Boateng', 'Kwame',  'Dermatology',  'R-12', 150.00, 'boateng@clinic.com'),
('Adjei',   'Yaw',    'Paediatrics',  'R-03', 100.00, 'adjei@clinic.com'),
('Osei',    'Kofi',   'Cardiology',   'R-07', 200.00, 'osei@clinic.com');

-- Appointments
-- Doctor 1 (Boateng): 10 appointments on 2026-08-10 → near cap (12)
-- Doctor 3 (Osei):    2 appointments on different days
-- Doctor 2 (Adjei):   ZERO  ← required
INSERT INTO appointments (patient_id, doctor_id, slot_datetime, fee_charged, status) VALUES
(1, 1, '2026-08-10 09:00:00', 150.00, 'booked'),
(1, 1, '2026-08-10 09:30:00', 150.00, 'booked'),
(2, 1, '2026-08-10 10:00:00', 150.00, 'booked'),
(2, 1, '2026-08-10 10:30:00', 150.00, 'booked'),
(3, 1, '2026-08-10 11:00:00', 150.00, 'booked'),
(3, 1, '2026-08-10 11:30:00', 150.00, 'booked'),
(1, 1, '2026-08-10 13:00:00', 150.00, 'booked'),
(2, 1, '2026-08-10 13:30:00', 150.00, 'booked'),
(3, 1, '2026-08-10 14:00:00', 150.00, 'booked'),
(1, 1, '2026-08-10 14:30:00', 150.00, 'booked'),

(2, 3, '2026-08-12 09:00:00', 200.00, 'booked'),
(3, 3, '2026-08-13 10:00:00', 200.00, 'booked');