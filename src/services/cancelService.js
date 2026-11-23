const pool = require('../config/db');
const { computeRefund } = require('./refundService');
const { httpError } = require('./validationService');

async function cancelAppointment(appointment_id) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      'SELECT * FROM appointments WHERE appointment_id = ? FOR UPDATE',
      [appointment_id]
    );
    
    const appt = rows[0];
    if (!appt) {
      throw httpError(404, 'Appointment not found');
    }
    if (appt.status === 'cancelled') {
      throw httpError(409, 'Appointment is already cancelled');
    }

    const { amount } = computeRefund(appt.fee_charged, appt.slot_datetime);

    await conn.query(
      `UPDATE appointments 
       SET status = 'cancelled', refund_amount = ?, cancelled_at = NOW() 
       WHERE appointment_id = ?`,
      [amount, appointment_id]
    );

    await conn.commit();
    return { appointment_id, refund_amount: amount };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { cancelAppointment };