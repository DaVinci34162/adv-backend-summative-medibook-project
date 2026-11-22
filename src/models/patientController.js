const patientModel = require('../models/patientModel');

async function create(req, res, next) {
  try {
    const { first_name, last_name, email, phone } = req.body;
    if (!first_name || !last_name || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields: first_name, last_name, email, phone' });
    }
    const id = await patientModel.createPatient(req.body);
    res.status(201).json({ patient_id: id, ...req.body });
  } catch (err) { next(err); }
}

async function getAll(req, res, next) {
  try {
    const patients = await patientModel.getAllPatients();
    res.json(patients);
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const patient = await patientModel.getPatientById(req.params.id);
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { first_name, last_name, email, phone } = req.body;
    if (!first_name || !last_name || !email || !phone) {
      return res.status(400).json({ error: 'Missing required fields: first_name, last_name, email, phone' });
    }
    const success = await patientModel.updatePatient(req.params.id, req.body);
    if (!success) return res.status(404).json({ error: 'Patient not found' });
    res.json({ message: 'Patient updated successfully' });
  } catch (err) { next(err); }
}

async function deleteOne(req, res, next) {
  try {
    const success = await patientModel.deletePatient(req.params.id);
    if (!success) return res.status(404).json({ error: 'Patient not found' });
    res.json({ message: 'Patient deleted successfully' });
  } catch (err) { next(err); }
}

module.exports = { create, getAll, getOne, update, deleteOne };