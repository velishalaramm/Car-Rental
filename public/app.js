const money = amount => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);
let cars = [];
let selectedType = "All";

const grid = document.getElementById("carGrid");
const modal = document.getElementById("bookingModal");
const today = new Date();
const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
document.getElementById("date").min = localDate;
document.getElementById("date").value = localDate;
document.getElementById("bookingDate").min = localDate;
document.getElementById("bookingDate").value = localDate;

async function loadCars() {
  try {
    const response = await fetch("/api/cars");
    if (!response.ok) throw new Error("Unable to load cars");
    cars = await response.json();
    renderCars();
  } catch (error) {
    grid.innerHTML = '<p class="loading">Could not load cars. Please refresh the page.</p>';
  }
}
function renderCars() {
  const visible = selectedType === "All" ? cars : cars.filter(car => car.type === selectedType);
  grid.innerHTML = visible.map(car => `
    <article class="car-card">
      <div class="car-image"><img src="${car.image}?auto=format&fit=crop&w=700&q=80" alt="${car.name}" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=700&q=80'"><span class="car-type">${car.type}</span></div>
      <div class="car-info"><div class="car-title-row"><h3>${car.name}</h3><small>★ 4.8</small></div>
      <div class="car-specs"><span>♙ ${car.seats} seats</span><span>⚙ ${car.transmission}</span><span>⛽ ${car.fuel}</span></div>
      <div class="car-bottom"><div class="price"><b>${money(car.price)}</b> <small>/ day</small></div><button class="book-btn" data-car="${car.id}">Book now ↗</button></div></div>
    </article>`).join("");
  grid.querySelectorAll("[data-car]").forEach(button => button.addEventListener("click", () => openBooking(Number(button.dataset.car))));
}
document.getElementById("filters").addEventListener("click", event => {
  const button = event.target.closest("[data-type]");
  if (!button) return;
  selectedType = button.dataset.type;
  document.querySelectorAll(".filter").forEach(item => item.classList.toggle("active", item === button));
  renderCars();
});
document.getElementById("searchBtn").addEventListener("click", () => {
  const duration = document.getElementById("duration").value;
  document.getElementById("bookingDays").value = duration;
  document.getElementById("bookingDate").value = document.getElementById("date").value || localDate;
  document.getElementById("fleet").scrollIntoView({ behavior: "smooth" });
});
function openBooking(id) {
  const car = cars.find(item => item.id === id);
  if (!car) return;
  document.getElementById("carId").value = car.id;
  document.getElementById("selectedCar").textContent = `${car.name} · ${money(car.price)} per day`;
  document.getElementById("bookingDays").value = document.getElementById("duration").value;
  document.getElementById("bookingDate").value = document.getElementById("date").value || localDate;
  document.getElementById("formMessage").textContent = "";
  updateTotal();
  modal.classList.remove("hidden");
  document.getElementById("customerName").focus();
}
function updateTotal() {
  const car = cars.find(item => item.id === Number(document.getElementById("carId").value));
  const days = Number(document.getElementById("bookingDays").value);
  document.getElementById("estimatedTotal").textContent = car ? money(car.price * days) : money(0);
}
document.getElementById("bookingDays").addEventListener("change", updateTotal);
document.getElementById("closeModal").addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", event => { if (event.target === modal) modal.classList.add("hidden"); });
document.addEventListener("keydown", event => { if (event.key === "Escape") modal.classList.add("hidden"); });
document.getElementById("bookingForm").addEventListener("submit", async event => {
  event.preventDefault();
  const message = document.getElementById("formMessage");
  const payload = {
    carId: Number(document.getElementById("carId").value),
    customerName: document.getElementById("customerName").value,
    email: document.getElementById("email").value,
    startDate: document.getElementById("bookingDate").value,
    days: Number(document.getElementById("bookingDays").value)
  };
  try {
    const response = await fetch("/api/bookings", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Booking failed");
    message.classList.remove("error");
    message.textContent = `${result.message} Reference: ${result.booking.id}`;
    event.target.reset();
    setTimeout(() => modal.classList.add("hidden"), 2200);
  } catch (error) {
    message.classList.add("error");
    message.textContent = error.message;
  }
});
loadCars();