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

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// Colors the position pill gold/silver/bronze when it recognizes 1st/2nd/3rd,
// otherwise falls back to a plain blue pill so any custom label still works
// (e.g. "Best Design", "Runner-up").
function rankPillClass(position) {
  const p = (position || "").toLowerCase();
  if (p.includes("1st") || p.includes("first") || p.trim() === "1") return "pill-gold";
  if (p.includes("2nd") || p.includes("second") || p.trim() === "2") return "pill-silver";
  if (p.includes("3rd") || p.includes("third") || p.trim() === "3") return "pill-bronze";
  return "pill-rank";
}

function winnerCardHtml(winner, index) {
  const cls = rankPillClass(winner.position);
  const meta = [winner.department, winner.year].filter(Boolean).join(" · ");
  const hasDetails = Boolean(winner.projectTitle || winner.description || winner.projectUrl || (winner.members && winner.members.length > 0));

  return `
    <div class="winner-card p-3 rounded-3 border d-flex align-items-center justify-content-between ${hasDetails ? 'has-project-details' : ''}"
         data-winner-idx="${index}"
         role="button"
         tabindex="0"
         style="cursor: pointer; transition: all 0.25s ease;"
         aria-label="View project details for ${escapeHtml(winner.name)}">
      <div class="d-flex align-items-center gap-3">
        <span class="pill ${cls}">${escapeHtml(winner.position || "")}</span>
        <div>
          <p class="fw-bold text-dark mb-0">${escapeHtml(winner.name)}</p>
          ${meta ? `<p class="text-subtle small mb-0">${escapeHtml(meta)}</p>` : ""}
        </div>
      </div>
      <div class="d-flex align-items-center gap-1.5 text-primary small fw-bold ms-auto">
        <span class="d-none d-sm-inline">View Project Details</span>
        <i class="bi bi-arrow-right-short fs-5"></i>
      </div>
    </div>
  `;
}

function showError() {
  document.getElementById("eventLoading").classList.add("d-none");
  document.getElementById("eventError").classList.remove("d-none");
}

function renderEvent(event) {
  document.getElementById("eventLoading").classList.add("d-none");
  document.getElementById("eventContent").classList.remove("d-none");

  // Dynamic JSON-LD Structured Data Injection (#32)
  try {
    const schemaScript = document.createElement("script");
    schemaScript.type = "application/ld+json";
    schemaScript.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Event",
      "name": event.title,
      "description": event.description,
      "startDate": event.date,
      "location": {
        "@type": "Place",
        "name": event.location || "Saranathan College of Engineering"
      },
      "organizer": {
        "@type": "Organization",
        "name": "MLSA SCE"
      }
    });
    document.head.appendChild(schemaScript);
  } catch (err) {}

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

  const shareBtn = document.getElementById("eventShareBtn");
  if (shareBtn) {
    shareBtn.onclick = (e) => {
      if (window.shareEvent) {
        window.shareEvent(e, event.title, event.tagline || '', event.id);
      } else if (navigator.share) {
        navigator.share({ title: event.title, text: event.tagline || event.title, url: window.location.href }).catch(() => {});
      } else {
        navigator.clipboard.writeText(window.location.href).then(() => {
          alert('Link copied to clipboard!');
        });
      }
    };
  }

  document.getElementById("eventDescription").textContent = event.description;
  if (event.linkUrl) {
    const linkEl = document.getElementById("eventLink");
    linkEl.href = encodeURI(event.linkUrl);
    linkEl.textContent = (event.linkLabel || "Learn more") + " →";
    linkEl.classList.remove("d-none");
  }

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
    if (isMicrosoftForm(event.registrationUrl)) {
      document.getElementById("regButtonWrap").classList.remove("d-none");
      document.getElementById("regButtonLink").href = event.registrationUrl;
    } else {
      document.getElementById("regFormWrap").classList.remove("d-none");
      document.getElementById("regFormFrame").src = toEmbedUrl(event.registrationUrl);
      document.getElementById("regFormLink").href = event.registrationUrl;
    }
  } else {
    document.getElementById("regComingSoon").classList.remove("d-none");
  }

  if (event.winners && event.winners.length > 0) {
    document.getElementById("winnersCard").classList.remove("d-none");
    const winnersListEl = document.getElementById("winnersList");
    winnersListEl.innerHTML = event.winners.map((w, idx) => winnerCardHtml(w, idx)).join("");

    const cards = winnersListEl.querySelectorAll(".winner-card");
    cards.forEach(card => {
      card.addEventListener("click", () => {
        const winnerIdx = parseInt(card.dataset.winnerIdx, 10);
        if (!isNaN(winnerIdx) && event.winners[winnerIdx] && window.openWinnerModal) {
          window.openWinnerModal(event.winners[winnerIdx], event);
        }
      });
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          card.click();
        }
      });
    });
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
function isMicrosoftForm(url) {
  return /forms\.(office|microsoft|cloud\.microsoft|microsoftonline)/.test(url);
}

loadEvent();
