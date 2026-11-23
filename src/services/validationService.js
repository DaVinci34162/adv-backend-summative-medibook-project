const {
  WORK_START_HOUR, WORK_END_HOUR, SLOT_MINUTES,
} = require('../utils/constants');

function validateSlot(slot, now = new Date()) {
  const d = new Date(slot);
  if (Number.isNaN(d.getTime())) {
    throw httpError(422, 'slot_datetime is not a valid date');
  }
  if (d.getTime() <= now.getTime()) {
    throw httpError(422, 'slot_datetime must be in the future');
  }
  const h = d.getHours();
  const m = d.getMinutes();
  if (h < WORK_START_HOUR || h >= WORK_END_HOUR) {
    throw httpError(422, `Slot must fall within working hours ${WORK_START_HOUR}:00–${WORK_END_HOUR}:00`);
  }
  if (m % SLOT_MINUTES !== 0 || d.getSeconds() !== 0 || d.getMilliseconds() !== 0) {
    throw httpError(422, `Slot must be on a ${SLOT_MINUTES}-minute boundary`);
  }
  return d;
}

function httpError(status, message) {
  const e = new Error(message);
  e.status = status;
  return e;
}

module.exports = { validateSlot, httpError };