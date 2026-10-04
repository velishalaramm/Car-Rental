const test = require("node:test");
const assert = require("node:assert/strict");
const { calculateTotal } = require("../src/pricing");

test("calculates rental total", () => {
  assert.equal(calculateTotal(2000, 3), 6000);
});
test("rejects invalid rental duration", () => {
  assert.throws(() => calculateTotal(2000, 0), /1–30 days/);
});