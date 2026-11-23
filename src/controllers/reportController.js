const reportModel = require('../models/reportModel');

async function doctorStats(req, res, next) {
  try {
    const stats = await reportModel.getDoctorStats(req.params.id);
    res.json(stats);
  } catch (err) { next(err); }
}

async function doctorsReport(req, res, next) {
  try {
    const report = await reportModel.getDoctorsReport();
    res.json(report);
  } catch (err) { next(err); }
}

async function busyDays(req, res, next) {
  try {
    const report = await reportModel.getBusyDays();
    res.json(report);
  } catch (err) { next(err); }
}

module.exports = { doctorStats, doctorsReport, busyDays };