const pool = require('../config/db');

async function createPatient({ first_name, last_name, email, phone }) {
  const [result] = await pool.query(
    'INSERT INTO patients (first_name, last_name, email, phone) VALUES (?, ?, ?, ?)',
    [first_name, last_name, email, phone]
  );
  return result.insertId;
}

async function getAllPatients() {
  const [rows] = await pool.query('SELECT * FROM patients ORDER BY patient_id ASC');
  return rows;
}

async function getPatientById(id) {
  const [rows] = await pool.query('SELECT * FROM patients WHERE patient_id = ?', [id]);
  return rows[0];
}

async function updatePatient(id, { first_name, last_name, email, phone }) {
  const [result] = await pool.query(
    'UPDATE patients SET first_name = ?, last_name = ?, email = ?, phone = ? WHERE patient_id = ?',
    [first_name, last_name, email, phone, id]
  );
  return result.affectedRows > 0;
}

async function deletePatient(id) {
  const [result] = await pool.query('DELETE FROM patients WHERE patient_id = ?', [id]);
  return result.affectedRows > 0;
}

module.exports = {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
};