function calculateTotal(pricePerDay, days) {
  const price = Number(pricePerDay);
  const duration = Number(days);
  if (!Number.isFinite(price) || price < 0) throw new Error("Invalid daily price");
  if (!Number.isInteger(duration) || duration < 1 || duration > 30) throw new Error("Rental duration must be 1–30 days");
  return price * duration;
}
module.exports = { calculateTotal };