// Read ?id= from the URL, e.g. event.html?id=3
const params = new URLSearchParams(window.location.search);
const eventId = params.get("id");

let currentEvent = null;

function isClosed(event) {
  const deadlinePassed = event.registration_deadline && new Date(event.registration_deadline) < new Date();
  return !event.is_open || deadlinePassed;
}

async function loadEvent() {
  if (!eventId) {
    showError();
    return;
  }
  try {
    currentEvent = await api.getEvent(eventId);
    renderEvent(currentEvent);
  } catch (err) {
    showError();
  }
}

function showError() {
  document.getElementById("eventLoading").classList.add("d-none");
  document.getElementById("eventError").classList.remove("d-none");
}

function renderEvent(event) {
  document.getElementById("eventLoading").classList.add("d-none");
  document.getElementById("eventContent").classList.remove("d-none");

  if (event.banner_note) {
    const el = document.getElementById("eventTagline");
    el.textContent = event.banner_note;
    el.classList.remove("d-none");
  }

  document.getElementById("eventTitle").textContent = event.title;
  document.getElementById("eventDescription").textContent = event.description;

  const date = new Date(event.event_date);
  document.getElementById("eventDate").textContent = date.toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  document.getElementById("eventTime").textContent = date.toLocaleTimeString("en-IN", {
    hour: "numeric", minute: "2-digit",
  });
  document.getElementById("eventLocation").textContent = event.location;

  if (event.capacity) {
    document.getElementById("eventCapacityRow").style.display = "flex";
    document.getElementById("eventCapacity").textContent = `Limited to ${event.capacity} seats`;
  }

  if (isClosed(event)) {
    document.getElementById("regClosed").classList.remove("d-none");
    document.getElementById("regForm").classList.add("d-none");
  }
}

document.getElementById("regForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const errorEl = document.getElementById("regError");
  const submitBtn = document.getElementById("regSubmitBtn");

  errorEl.classList.add("d-none");
  submitBtn.disabled = true;
  submitBtn.textContent = "Registering…";

  const payload = {
    event_id: Number(eventId),
    full_name: form.full_name.value,
    email: form.email.value,
    phone: form.phone.value || null,
    college: form.college.value || null,
    department: form.department.value || null,
    year_of_study: form.year_of_study.value || null,
  };

  try {
    await api.register(payload);
    document.getElementById("regSuccessEmail").textContent = payload.email;
    document.getElementById("regSuccess").classList.remove("d-none");
    form.classList.add("d-none");
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove("d-none");
    submitBtn.disabled = false;
    submitBtn.textContent = "Confirm registration";
  }
});

loadEvent();
