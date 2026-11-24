const { computeRefund } = require('../src/services/refundService');

const NOW = new Date('2025-01-01T00:00:00Z');

function slotAfterHours(h) {
  return new Date(NOW.getTime() + h * 36e5);
}

describe('refund calculator — tier boundaries', () => {
  test('exactly 48h → 50% (boundary belongs to partial tier)', () => {
    const r = computeRefund(200, slotAfterHours(48), NOW);
    expect(r.percent).toBe(0.5);
    expect(r.amount).toBe(100);
  });

  test('just over 48h → 100%', () => {
    const r = computeRefund(200, slotAfterHours(48 + 1/3600), NOW);
    expect(r.amount).toBe(200);
  });

  test('exactly 24h → 50% (lower boundary of partial tier)', () => {
    const r = computeRefund(200, slotAfterHours(24), NOW);
    expect(r.amount).toBe(100);
  });

  test('just under 24h → 0%', () => {
    const r = computeRefund(200, slotAfterHours(24 - 1/3600), NOW);
    expect(r.amount).toBe(0);
  });

  test('72h → 100%', () => {
    const r = computeRefund(150, slotAfterHours(72), NOW);
    expect(r.amount).toBe(150);
  });

  test('36h → 50% of 150 = 75.00', () => {
    const r = computeRefund(150, slotAfterHours(36), NOW);
    expect(r.amount).toBe(75);
  });
});