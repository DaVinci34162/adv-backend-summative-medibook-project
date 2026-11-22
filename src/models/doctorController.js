const doctorModel = require('../models/doctorModel');

async function create(req, res, next) {
  try {
    const { first_name, last_name, specialty, room, consultation_fee, email } = req.body;
    if (!first_name || !last_name || !specialty || !room || !consultation_fee || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const id = await doctorModel.createDoctor(req.body);
    res.status(201).json({ doctor_id: id, ...req.body });
  } catch (err) { next(err); }
}

async function getAll(req, res, next) {
  try {
    const doctors = await doctorModel.getAllDoctors();
    res.json(doctors);
  } catch (err) { next(err); }
}

async function getOne(req, res, next) {
  try {
    const doctor = await doctorModel.getDoctorById(req.params.id);
    if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
    res.json(doctor);
  } catch (err) { next(err); }
}

async function update(req, res, next) {
  try {
    const { first_name, last_name, specialty, room, consultation_fee, email } = req.body;
    if (!first_name || !last_name || !specialty || !room || !consultation_fee || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    const success = await doctorModel.updateDoctor(req.params.id, req.body);
    if (!success) return res.status(404).json({ error: 'Doctor not found' });
    res.json({ message: 'Doctor updated successfully' });
  } catch (err) { next(err); }
}

async function deleteOne(req, res, next) {
  try {
    const success = await doctorModel.deleteDoctor(req.params.id);
    if (!success) return res.status(404).json({ error: 'Doctor not found' });
    res.json({ message: 'Doctor deleted successfully' });
  } catch (err) { next(err); }
}

module.exports = { create, getAll, getOne, update, deleteOne };