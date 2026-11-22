-- database/schema.sql
SET FOREIGN_KEY_CHECKS=0;
DROP DATABASE IF EXISTS medibook;
CREATE DATABASE medibook CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE medibook;

-- ============================================================
-- patients  (1:N with appointments)
-- ============================================================
CREATE TABLE patients (
  patient_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name    VARCHAR(50)  NOT NULL,
  last_name     VARCHAR(50)  NOT NULL,
  email         VARCHAR(120) NOT NULL,
  phone         VARCHAR(20)  NOT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_patient_email UNIQUE (email),
  CONSTRAINT chk_patient_email CHECK (email LIKE '%@%.%'),
  CONSTRAINT chk_patient_phone CHECK (CHAR_LENGTH(phone) >= 7)
);

-- ============================================================
-- doctors  (1:N with appointments)
-- ============================================================
CREATE TABLE doctors (
  doctor_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  first_name       VARCHAR(50)   NOT NULL,
  last_name        VARCHAR(50)   NOT NULL,
  specialty        VARCHAR(80)   NOT NULL,
  room             VARCHAR(10)   NOT NULL,
  consultation_fee DECIMAL(10,2) NOT NULL,
  email            VARCHAR(120)  NOT NULL,
  created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_doctor_email UNIQUE (email),
  CONSTRAINT chk_doctor_fee  CHECK (consultation_fee >= 0)
);

-- ============================================================
-- appointments  (bridging table)
--  - 30-minute slots, future-only, 09:00-17:00 enforced in app layer
--  - active_slot_key: generated NULL for cancelled rows, so UNIQUE
--    only enforces "one active booking per (doctor, slot)".
-- ============================================================
CREATE TABLE appointments (
  appointment_id  INT AUTO_INCREMENT PRIMARY KEY,
  patient_id      INT UNSIGNED NOT NULL,
  doctor_id       INT UNSIGNED NOT NULL,
  slot_datetime   DATETIME NOT NULL,
  status          ENUM('booked','cancelled','completed') NOT NULL DEFAULT 'booked',
  fee_charged     DECIMAL(10,2) NOT NULL,
  refund_amount   DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  cancelled_at    DATETIME NULL,

  CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id) REFERENCES patients(patient_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_appt_doctor  FOREIGN KEY (doctor_id)  REFERENCES doctors(doctor_id)
    ON DELETE RESTRICT ON UPDATE CASCADE,

  CONSTRAINT chk_appt_refund_le_fee CHECK (refund_amount <= fee_charged),
  CONSTRAINT chk_appt_fee_nonneg    CHECK (fee_charged   >= 0),
  CONSTRAINT chk_appt_status_time   CHECK (
    (status <> 'cancelled') OR (cancelled_at IS NOT NULL)
  ),

  -- Rule: a doctor cannot have two ACTIVE appointments at the same datetime.
    active_slot_key VARCHAR(80) COLLATE utf8mb4_unicode_ci
    GENERATED ALWAYS AS (
      CASE WHEN status = 'booked'
           THEN CONCAT(CAST(doctor_id AS CHAR), '-', DATE_FORMAT(slot_datetime, '%Y%m%d%H%i'))
           ELSE NULL
      END
    ) STORED,
  CONSTRAINT uq_active_doctor_slot UNIQUE (active_slot_key),

  INDEX idx_appt_doctor_slot (doctor_id, slot_datetime),
  INDEX idx_appt_patient     (patient_id),
  INDEX idx_appt_status      (status)
);
SET FOREIGN_KEY_CHECKS=1;