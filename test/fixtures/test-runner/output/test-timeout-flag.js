// Flags: --test-timeout=20
'use strict';
const { describe, test } = require('node:test');
const { setTimeout } = require('node:timers/promises');

describe('--test-timeout is set to 20ms', async () => {
  await test('should timeout after 20ms', async () => {
    await setTimeout(200000, undefined, { ref: false });
  });
  await test('should timeout after 5ms', { timeout: 5 }, async () => {
    await setTimeout(200000, undefined, { ref: false });
  });

  await test('should not timeout', { timeout: 50000 }, async () => {
    await setTimeout(1);
  });

  await test('should pass', async () => {});
});
