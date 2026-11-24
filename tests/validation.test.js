const { validateSlot } = require('../src/services/validationService');

const NOW = new Date(2025, 0, 6, 8, 0, 0);

function at(hour, minute, dayOffset = 1) {
  return new Date(2025, 0, 6 + dayOffset, hour, minute, 0);
}

describe('validateSlot', () => {
  test('valid 30-minute boundary within hours', () => {
    expect(() => validateSlot(at(9, 0), NOW)).not.toThrow();
  });

  test('invalid: off 30-minute boundary (09:15)', () => {
    expect(() => validateSlot(at(9, 15), NOW)).toThrow(/30-minute boundary/);
  });

  test('invalid: before opening (08:30)', () => {
    expect(() => validateSlot(at(8, 30), NOW)).toThrow(/working hours/);
  });

  test('invalid: exactly 17:00 (must fit before closing)', () => {
    expect(() => validateSlot(at(17, 0), NOW)).toThrow(/working hours/);
  });

  test('valid: last slot 16:30', () => {
    expect(() => validateSlot(at(16, 30), NOW)).not.toThrow();
  });

  test('invalid: past date', () => {
    expect(() => validateSlot(new Date(2020, 0, 1, 10, 0), NOW)).toThrow(/future/);
  });

  test('invalid: malformed date string', () => {
    expect(() => validateSlot('not-a-date', NOW)).toThrow(/valid date/);
  });
});