const {
  REFUND_FULL_HOURS,
  REFUND_PARTIAL_HOURS,
  REFUND_PARTIAL_PERCENT,
} = require('../utils/constants');

function computeRefund(fee, slot, now = new Date()) {
  const slotMs  = new Date(slot).getTime();
  const nowMs   = new Date(now).getTime();
  const hours   = (slotMs - nowMs) / 36e5;

  let percent = 0;
  if (hours > REFUND_FULL_HOURS)             percent = 1;
  else if (hours >= REFUND_PARTIAL_HOURS)    percent = REFUND_PARTIAL_PERCENT;

  const amount = Number((fee * percent).toFixed(2));
  return { percent, amount, hours };
}

module.exports = { computeRefund };