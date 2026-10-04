const express = require("express");
const path = require("path");
const { calculateTotal } = require("./src/pricing");

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const cars = [
  { id: 1, name: "Hyundai Creta", type: "SUV", price: 2800, seats: 5, fuel: "Petrol", transmission: "Automatic", image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6" },
  { id: 2, name: "Maruti Swift", type: "Hatchback", price: 1500, seats: 5, fuel: "Petrol", transmission: "Manual", image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2" },
  { id: 3, name: "Honda City", type: "Sedan", price: 2200, seats: 5, fuel: "Petrol", transmission: "Automatic", image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d" },
  { id: 4, name: "Toyota Innova", type: "MUV", price: 3500, seats: 7, fuel: "Diesel", transmission: "Manual", image: "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b" },
  { id: 5, name: "Kia Seltos", type: "SUV", price: 3000, seats: 5, fuel: "Diesel", transmission: "Automatic", image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7" },
  { id: 6, name: "Tata Tiago", type: "Hatchback", price: 1300, seats: 5, fuel: "Petrol", transmission: "Manual", image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70" }
];
const bookings = [];

app.get("/api/health", (_req, res) => res.json({ status: "UP", app: "Ramm Car Rental" }));
app.get("/api/cars", (_req, res) => res.json(cars));

app.post("/api/bookings", (req, res) => {
  const { carId, customerName, email, startDate, days } = req.body || {};
  const car = cars.find(item => item.id === Number(carId));
  if (!car || !customerName?.trim() || !email?.trim() || !startDate) {
    return res.status(400).json({ message: "Please provide valid booking details." });
  }
  const duration = Number(days);
  let total;
  try { total = calculateTotal(car.price, duration); }
  catch (error) { return res.status(400).json({ message: error.message }); }
  const booking = {
    id: `RAMM-${Date.now()}`,
    car: car.name,
    customerName: customerName.trim(),
    email: email.trim(),
    startDate,
    days: duration,
    total
  };
  bookings.push(booking);
  res.status(201).json({ message: "Booking request received!", booking });
});

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => console.log(`Ramm Car Rental running on port ${PORT}`));
}
module.exports = app;