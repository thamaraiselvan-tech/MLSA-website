// Reads from the EVENTS array defined in data/events.js - no backend, no fetch.

const params = new URLSearchParams(window.location.search);
const eventId = params.get("id");

function isClosed(event) {
  const deadlinePassed = event.registrationDeadline && new Date(event.registrationDeadline) < new Date();
  return event.isOpen === false || deadlinePassed;
}

// Turns a normal Google Form "viewform" link into the embeddable version.
function toEmbedUrl(url) {
  if (!url) return "";
  const separator = url.includes("?") ? "&" : "?";
  return `${url}${separator}embedded=true`;
}

function showError() {
  document.getElementById("eventLoading").classList.add("d-none");
  document.getElementById("eventError").classList.remove("d-none");
}

function renderEvent(event) {
  document.getElementById("eventLoading").classList.add("d-none");
  document.getElementById("eventContent").classList.remove("d-none");

  if (event.image) {
    const imgEl = document.getElementById("eventImage");
    imgEl.src = event.image;
    imgEl.classList.remove("d-none");
  }

  if (event.tagline) {
    const el = document.getElementById("eventTagline");
    el.textContent = event.tagline;
    el.classList.remove("d-none");
  }

  document.getElementById("eventTitle").textContent = event.title;
  document.getElementById("eventDescription").textContent = event.description;

  const date = new Date(event.date);
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

  // ---- Registration section ----
  if (isClosed(event)) {
    document.getElementById("regClosed").classList.remove("d-none");
  } else if (event.registrationUrl) {
    document.getElementById("regFormWrap").classList.remove("d-none");
    document.getElementById("regFormFrame").src = toEmbedUrl(event.registrationUrl);
    document.getElementById("regFormLink").href = event.registrationUrl;
  } else {
    document.getElementById("regComingSoon").classList.remove("d-none");
  }
}

function loadEvent() {
  if (!eventId) {
    showError();
    return;
  }
  const event = EVENTS.find((e) => String(e.id) === String(eventId));
  if (!event) {
    showError();
    return;
  }
  renderEvent(event);
}

loadEvent();
