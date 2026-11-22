const pool = require('../config/db');

async function createAppointment(conn, { patient_id, doctor_id, slot_datetime, fee_charged }) {
  const [result] = await conn.query(
    'INSERT INTO appointments (patient_id, doctor_id, slot_datetime, fee_charged) VALUES (?, ?, ?, ?)',
    [patient_id, doctor_id, slot_datetime, fee_charged]
  );
  return result.insertId;
}

async function getAppointmentById(id) {
  const [rows] = await pool.query('SELECT * FROM appointments WHERE appointment_id = ?', [id]);
  return rows[0];
}

async function updateAppointmentStatus(conn, id, status, refund_amount = 0.00) {
  const cancelled_at = status === 'cancelled' ? new Date() : null;
  const [result] = await conn.query(
    'UPDATE appointments SET status = ?, refund_amount = ?, cancelled_at = ? WHERE appointment_id = ?',
    [status, refund_amount, cancelled_at, id]
  );
  return result.affectedRows > 0;
}

module.exports = {
  createAppointment,
  getAppointmentById,
  updateAppointmentStatus,
};