const pool = require('../config/db');

async function getDoctorStats(doctor_id) {
  const [summary] = await pool.query(
    `SELECT 
       COALESCE(SUM(fee_charged - refund_amount), 0) AS revenue_collected,
       COUNT(CASE WHEN slot_datetime >= NOW() AND status = 'booked' THEN 1 END) AS upcoming_count
     FROM appointments 
     WHERE doctor_id = ? AND status != 'completed'`,
    [doctor_id]
  );

  const [daily] = await pool.query(
    `SELECT 
       DATE(slot_datetime) AS date,
       COUNT(*) AS bookings,
       ROUND((COUNT(*) / 12) * 100, 2) AS utilization_percent
     FROM appointments 
     WHERE doctor_id = ? 
       AND status = 'booked' 
       AND slot_datetime >= CURDATE() 
       AND slot_datetime < DATE_ADD(CURDATE(), INTERVAL 7 DAY)
     GROUP BY DATE(slot_datetime)
     ORDER BY date ASC`,
    [doctor_id]
  );

  return {
    revenue_collected: summary[0].revenue_collected,
    upcoming_count: summary[0].upcoming_count,
    next_7_days: daily
  };
}

async function getDoctorsReport() {
  const [rows] = await pool.query(
    `SELECT 
       d.doctor_id,
       d.first_name,
       d.last_name,
       d.specialty,
       COUNT(a.appointment_id) AS total_appointments,
       COALESCE(SUM(a.fee_charged - a.refund_amount), 0) AS total_revenue
     FROM doctors d
     LEFT JOIN appointments a ON d.doctor_id = a.doctor_id AND a.status != 'cancelled'
     GROUP BY d.doctor_id
     ORDER BY total_revenue DESC`
  );
  return rows;
}

async function getBusyDays() {
  const [rows] = await pool.query(
    `SELECT 
       d.first_name,
       d.last_name,
       DATE(a.slot_datetime) AS busy_date,
       COUNT(a.appointment_id) AS total_bookings
     FROM appointments a
     JOIN doctors d ON a.doctor_id = d.doctor_id
     WHERE a.status = 'booked'
     GROUP BY a.doctor_id, DATE(a.slot_datetime)
     HAVING total_bookings >= 10
     ORDER BY total_bookings DESC`
  );
  return rows;
}

module.exports = { getDoctorStats, getDoctorsReport, getBusyDays };