const { logEvent } = require('./auditService');
const pool = require('../config/db');
const { validateSlot, httpError } = require('./validationService');
const {
  MAX_APPOINTMENTS_PER_DAY,
} = require('../utils/constants');

async function bookAppointment({ patient_id, doctor_id, slot_datetime }) {
  const parsedSlot = validateSlot(slot_datetime);

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [doctorRows] = await conn.query(
      'SELECT consultation_fee FROM doctors WHERE doctor_id = ?', 
      [doctor_id]
    );
    if (doctorRows.length === 0) {
      throw httpError(404, 'Doctor not found');
    }
    const fee = doctorRows[0].consultation_fee;

    const dayStart = new Date(parsedSlot);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const [countRows] = await conn.query(
      `SELECT COUNT(*) AS count FROM appointments 
       WHERE doctor_id = ? AND slot_datetime >= ? AND slot_datetime < ? AND status = 'booked' FOR UPDATE`,
      [doctor_id, dayStart, dayEnd]
    );

    if (countRows[0].count >= MAX_APPOINTMENTS_PER_DAY) {
      throw httpError(409, 'Doctor has reached the maximum of 12 appointments for this day');
    }

    const [slotRows] = await conn.query(
      `SELECT 1 FROM appointments 
       WHERE doctor_id = ? AND slot_datetime = ? AND status = 'booked'`,
      [doctor_id, parsedSlot]
    );
    if (slotRows.length > 0) {
      throw httpError(409, 'This time slot is already booked');
    }

    const [result] = await conn.query(
      `INSERT INTO appointments (patient_id, doctor_id, slot_datetime, fee_charged) 
       VALUES (?, ?, ?, ?)`,
      [patient_id, doctor_id, parsedSlot, fee]
    );

    await conn.commit();
    await logEvent('APPOINTMENT_BOOKED', {
      appointment_id: result.insertId,
      patient_id,
      doctor_id,
      slot_datetime: parsedSlot,
      fee_charged: fee
    });
    return {
      appointment_id: result.insertId,
      patient_id,
      doctor_id,
      slot_datetime: parsedSlot,
      fee_charged: fee,
      status: 'booked'
    };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { bookAppointment };