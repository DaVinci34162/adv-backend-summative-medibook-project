require('dotenv').config();
const { Worker } = require('bullmq');
const redisConfig = { 
  host: process.env.REDIS_HOST || '127.0.0.1', 
  port: Number(process.env.REDIS_PORT) || 6379 
};

const { popFromWaitlist, requeue } = require('../src/services/waitlistService');
const { bookAppointment } = require('../src/services/bookingService');
const { logEvent } = require('../src/services/auditService');

console.log('⏳ Waitlist Worker started. Listening for cancellations...');

const worker = new Worker('WaitlistPromotion', async (job) => {
  const { doctor_id, slot_datetime } = job.data;
  console.log(`🔔 Cancellation detected for Doctor ${doctor_id} at ${slot_datetime}`);

  // 1. Pop the first patient from the Redis waitlist
  const patientId = await popFromWaitlist(doctor_id, slot_datetime);
  
  if (!patientId) {
    console.log('No one on the waitlist for this slot.');
    return;
  }

  console.log(`Attempting to promote patient ${patientId}...`);

  try {
    // 2. Try to book them into the freed slot
    await bookAppointment({ 
      patient_id: Number(patientId), 
      doctor_id, 
      slot_datetime 
    });
    
    console.log(`✅ Successfully booked patient ${patientId} from waitlist.`);
    
  } catch (err) {
    console.error(`❌ Promotion failed for patient ${patientId}:`, err.message);
    
    // 3. THE CRITICAL RULE: Re-queue them if the booking failed!
    await requeue(doctor_id, slot_datetime, patientId);
    console.log(`🔁 Re-queued patient ${patientId} back to the front of the waitlist.`);
    
    await logEvent('WAITLIST_PROMOTION_FAILED', { doctor_id, slot_datetime, patientId, error: err.message });
  }
}, { connection: redisConfig });

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed with error: ${err.message}`);
});