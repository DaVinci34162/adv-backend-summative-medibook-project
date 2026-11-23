const { logEvent } = require('./auditService');
const pool = require('../config/db');
const { computeRefund } = require('./refundService');
const { httpError } = require('./validationService');
const { Queue } = require('bullmq');
const redisConfig = { 
  host: process.env.REDIS_HOST || '127.0.0.1', 
  port: Number(process.env.REDIS_PORT) || 6379 
};
const waitlistQueue = new Queue('WaitlistPromotion', { connection: redisConfig });

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
    await waitlistQueue.add('promote', {
      doctor_id: appt.doctor_id,
      slot_datetime: appt.slot_datetime
    })
    await logEvent('APPOINTMENT_CANCELLED', {
      appointment_id,
      refund_amount: amount
    });
    return { appointment_id, refund_amount: amount };

  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

module.exports = { cancelAppointment };