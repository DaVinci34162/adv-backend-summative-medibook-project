const { bookAppointment } = require('../services/bookingService');
const { cancelAppointment } = require('../services/cancelService');

async function book(req, res, next) {
  try {
    const { patient_id, doctor_id, slot_datetime } = req.body;
    if (!patient_id || !doctor_id || !slot_datetime) {
      return res.status(400).json({ error: 'Missing required fields: patient_id, doctor_id, slot_datetime' });
    }

    const result = await bookAppointment({ patient_id, doctor_id, slot_datetime });
    res.status(201).json(result);
  } catch (err) { next(err); }
}

async function cancel(req, res, next) {
  try {
    const result = await cancelAppointment(req.params.id);
    res.json(result);
  } catch (err) { next(err); }
}

module.exports = { book, cancel };