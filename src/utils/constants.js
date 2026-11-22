module.exports = {
  WORK_START_HOUR: 9,
  WORK_END_HOUR: 17,
  SLOT_MINUTES: 30,
  MAX_APPOINTMENTS_PER_DAY: 12,
  BUSY_THRESHOLD_RATIO: 0.8,
  REFUND_FULL_HOURS: 48,
  REFUND_PARTIAL_HOURS: 24,
  REFUND_PARTIAL_PERCENT: 0.5,
  AUDIT_LOG_PATH: 'logs/audit.log',
  // Helper to generate Redis waitlist keys
  WAITLIST_KEY: (doctorId, isoSlot) =>
    `waitlist:${doctorId}:${isoSlot.replace(/[-:TZ.]/g, '').slice(0, 12)}`,
};