const redis = require('../config/redis');
const { WAITLIST_KEY } = require('../utils/constants');

async function addToWaitlist(doctor_id, slot_datetime, patient_id) {
  const isoSlot = new Date(slot_datetime).toISOString();
  const key = WAITLIST_KEY(doctor_id, isoSlot);
  
  // RPUSH adds to the end of the queue
  await redis.rpush(key, patient_id);
  return { message: 'Added to waitlist', key };
}

async function popFromWaitlist(doctor_id, slot_datetime) {
  const isoSlot = new Date(slot_datetime).toISOString();
  const key = WAITLIST_KEY(doctor_id, isoSlot);
  
  // LPOP removes from the front of the queue (FIFO)
  const patientId = await redis.lpop(key);
  return patientId;
}

async function requeue(doctor_id, slot_datetime, patient_id) {
  const isoSlot = new Date(slot_datetime).toISOString();
  const key = WAITLIST_KEY(doctor_id, isoSlot);
  
  // LPUSH puts them back at the front if the booking failed
  await redis.lpush(key, patient_id);
}

module.exports = { addToWaitlist, popFromWaitlist, requeue };