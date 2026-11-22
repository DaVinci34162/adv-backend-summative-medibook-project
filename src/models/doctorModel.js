const pool = require('../config/db');

async function createDoctor({ first_name, last_name, specialty, room, consultation_fee, email }) {
  const [result] = await pool.query(
    'INSERT INTO doctors (first_name, last_name, specialty, room, consultation_fee, email) VALUES (?, ?, ?, ?, ?, ?)',
    [first_name, last_name, specialty, room, consultation_fee, email]
  );
  return result.insertId;
}

async function getAllDoctors() {
  const [rows] = await pool.query('SELECT * FROM doctors ORDER BY doctor_id ASC');
  return rows;
}

async function getDoctorById(id) {
  const [rows] = await pool.query('SELECT * FROM doctors WHERE doctor_id = ?', [id]);
  return rows[0];
}

async function updateDoctor(id, { first_name, last_name, specialty, room, consultation_fee, email }) {
  const [result] = await pool.query(
    'UPDATE doctors SET first_name = ?, last_name = ?, specialty = ?, room = ?, consultation_fee = ?, email = ? WHERE doctor_id = ?',
    [first_name, last_name, specialty, room, consultation_fee, email, id]
  );
  return result.affectedRows > 0;
}

async function deleteDoctor(id) {
  const [result] = await pool.query('DELETE FROM doctors WHERE doctor_id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  createDoctor,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
};