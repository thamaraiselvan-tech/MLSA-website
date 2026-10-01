// Reads from the EVENTS array defined in data/events.js and pulls out every
// event that has a non-empty "winners" list.

function escapeHtml(str) {
  if (!str) return "";
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function getRankDetails(position) {
  const p = (position || "").toLowerCase();
  if (p.includes("1st") || p.includes("first") || p.trim() === "1") {
    return { class: "rank-gold", icon: "🥇", label: "1ST PLACE", shortLabel: "1ST" };
  }
  if (p.includes("2nd") || p.includes("second") || p.trim() === "2") {
    return { class: "rank-silver", icon: "🥈", label: "2ND PLACE", shortLabel: "2ND" };
  }
  if (p.includes("3rd") || p.includes("third") || p.trim() === "3") {
    return { class: "rank-bronze", icon: "🥉", label: "3RD PLACE", shortLabel: "3RD" };
  }
  return { class: "rank-general", icon: "🏆", label: escapeHtml(position), shortLabel: escapeHtml(position) };
}

function winnerCardHtml(winner, eventIndex, winnerIndex) {
  const rank = getRankDetails(winner.position);
  const meta = [winner.department, winner.year].filter(Boolean).join(" · ");
  const hasProject = Boolean(winner.projectTitle || winner.description || winner.projectUrl || (winner.members && winner.members.length > 0) || winner.name);

  return `
    <div class="col-4 col-md-3 d-flex justify-content-center">
      <div class="winner-podium-card square-card ${rank.class} ${hasProject ? 'has-project-details' : ''}"
           data-event-idx="${eventIndex}"
           data-winner-idx="${winnerIndex}"
           role="button"
           tabindex="0"
           aria-label="View project details for ${escapeHtml(winner.name)}">
        <div class="winner-podium-header mb-2">
          <span class="winner-rank-badge d-none d-sm-inline-block">${rank.icon} ${rank.label}</span>
          <span class="winner-rank-badge d-inline-block d-sm-none">${rank.icon} ${rank.shortLabel}</span>
        </div>
        <div class="winner-podium-body text-center">
          <h3 class="winner-name fw-bold mb-1">${escapeHtml(winner.name)}</h3>
          ${meta ? `<p class="winner-meta text-subtle mb-0">${escapeHtml(meta)}</p>` : ""}
          ${hasProject ? `
            <div class="winner-project-chip">
              <i class="bi bi-rocket-takeoff-fill"></i>
              <span>View Project</span>
            </div>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

function eventGroupHtml(event, eventIndex) {
  const date = new Date(event.date);
  const dateLabel = date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  const posterHtml = event.image
    ? `<img src="${event.image}" alt="${escapeHtml(event.title)}" class="winner-event-thumb flex-shrink-0">`
    : `<div class="winner-event-thumb-placeholder flex-shrink-0"><i class="bi bi-trophy-fill"></i></div>`;

  return `
    <div class="winners-event-group mb-5">
      <div class="card-fluent p-3 p-md-4 mb-4 winner-event-header-card">
        <div class="d-flex align-items-center gap-3 mb-2">
          ${posterHtml}
          <div class="flex-grow-1 min-w-0">
            <span class="badge bg-primary-subtle text-primary border mb-1" style="font-size: 11px;">
              <i class="bi bi-calendar3 me-1"></i>${dateLabel}
            </span>
            <h2 class="h5 h4-md fw-bold mb-0 text-dark">
              <a href="event.html?id=${event.id}" class="link-fluent text-dark text-decoration-none">${escapeHtml(event.title)}</a>
            </h2>
          </div>
        </div>
        <p class="text-subtle small mb-3">${escapeHtml(event.tagline || 'Flagship Event Winners & Honors')}</p>
        <div>
          <a href="event.html?id=${event.id}" class="btn btn-fluent-secondary btn-sm d-inline-flex align-items-center gap-1">
            <span>Event details</span> &rarr;
          </a>
        </div>
      </div>
      <div class="row g-2 g-md-4 justify-content-center">
        ${event.winners.map((w, winnerIdx) => winnerCardHtml(w, eventIndex, winnerIdx)).join("")}
      </div>
    </div>
  `;
}

let eventsWithWinners = [];

function loadWinners() {
  const statusEl = document.getElementById("winnersStatus");
  const groupsEl = document.getElementById("winnersGroups");

  if (!statusEl || !groupsEl) {
    bindWinnerModalEvents();
    return;
  }

  eventsWithWinners = [...EVENTS]
    .filter((e) => e.winners && e.winners.length > 0)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  if (eventsWithWinners.length === 0) {
    statusEl.innerHTML = "";
    groupsEl.innerHTML = `
      <div class="card-fluent p-5 text-center">
        <p class="fw-semibold mb-1">No winners announced yet</p>
        <p class="text-subtle small mb-0">Once results are added to an event, they'll show up here automatically.</p>
      </div>`;
    bindWinnerModalEvents();
    return;
  }

  statusEl.innerHTML = "";
  groupsEl.innerHTML = eventsWithWinners.map((e, idx) => eventGroupHtml(e, idx)).join("");

  bindWinnerModalEvents();
}

// Modal Handling Logic
function bindWinnerModalEvents() {
  const modal = document.getElementById("winnerModal");
  const closeBtn = document.getElementById("winnerModalClose");
  const backdrop = modal ? modal.querySelector(".winner-modal-backdrop") : null;

  if (!modal) return;

  window.openWinnerModal = openWinnerModal;

  const cards = document.querySelectorAll(".winner-podium-card.has-project-details");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      const eventIdx = parseInt(card.dataset.eventIdx, 10);
      const winnerIdx = parseInt(card.dataset.winnerIdx, 10);

      if (!isNaN(eventIdx) && !isNaN(winnerIdx) && eventsWithWinners[eventIdx] && eventsWithWinners[eventIdx].winners[winnerIdx]) {
        openWinnerModal(eventsWithWinners[eventIdx].winners[winnerIdx], eventsWithWinners[eventIdx]);
      }
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });
  });

  function getToolIcon(toolName) {
    const t = (toolName || "").toLowerCase();
    if (t.includes("copilot")) return '<i class="bi bi-microsoft text-primary me-2"></i>';
    if (t.includes("designer")) return '<i class="bi bi-palette-fill text-purple me-2"></i>';
    if (t.includes("azure")) return '<i class="bi bi-cloud-fill text-info me-2"></i>';
    if (t.includes("html") || t.includes("css") || t.includes("js") || t.includes("script")) return '<i class="bi bi-code-slash text-success me-2"></i>';
    if (t.includes("python")) return '<i class="bi bi-filetype-py text-warning me-2"></i>';
    if (t.includes("bootstrap")) return '<i class="bi bi-bootstrap-fill text-primary me-2"></i>';
    if (t.includes("figma") || t.includes("canva")) return '<i class="bi bi-vector-pen text-danger me-2"></i>';
    return '<i class="bi bi-cpu-fill text-primary me-2"></i>';
  }

  function openWinnerModal(winner, event) {
    const rank = getRankDetails(winner.position);
    
    // Header
    const rankBadge = document.getElementById("wmRankBadge");
    if (rankBadge) {
      rankBadge.textContent = `${rank.icon} ${rank.label} WINNER`;
      let rankStyle = "gold";
      if (rank.class.includes("silver")) rankStyle = "silver";
      else if (rank.class.includes("bronze")) rankStyle = "bronze";
      else if (rank.class.includes("general")) rankStyle = "general";

      rankBadge.className = `wm-rank-pill ${rankStyle}`;
    }

    const teamName = document.getElementById("wmTeamName");
    if (teamName) teamName.textContent = winner.name;

    const eventTitle = document.getElementById("wmEventTitle");
    if (eventTitle) eventTitle.innerHTML = `<i class="bi bi-trophy-fill me-1.5 text-warning"></i> ${escapeHtml(event.title)}`;

    // Body
    const projectTitle = document.getElementById("wmProjectTitle");
    if (projectTitle) projectTitle.innerHTML = `<i class="bi bi-lightbulb-fill text-primary me-2" style="font-size: 1.1rem;"></i>${escapeHtml(winner.projectTitle || "Winner Project Concept")}`;

    const description = document.getElementById("wmDescription");
    if (description) description.textContent = winner.description || "Project overview submission for the competition.";

    // Tools
    const toolsContainer = document.getElementById("wmTools");
    if (toolsContainer) {
      if (winner.tools && winner.tools.length > 0) {
        toolsContainer.innerHTML = winner.tools.map(tool => `
          <span class="wm-tool-chip">${getToolIcon(tool)}${escapeHtml(tool)}</span>
        `).join("");
      } else {
        toolsContainer.innerHTML = `<span class="wm-tool-chip"><i class="bi bi-microsoft text-primary me-2"></i>Microsoft Copilot</span><span class="wm-tool-chip"><i class="bi bi-palette-fill text-purple me-2"></i>Microsoft Designer</span>`;
      }
    }

    // Members (Listed one by one for team events, or Spotlight Card for individual winners)
    const membersContainer = document.getElementById("wmMembers");
    const isIndividual = !winner.members || winner.members.length <= 1;

    if (membersContainer) {
      if (isIndividual) {
        const deptYearStr = [winner.department, winner.year].filter(Boolean).join(" · ");
        const initial = (winner.name || "W").charAt(0).toUpperCase();

        membersContainer.innerHTML = `
          <div class="wm-solo-winner-card d-flex flex-column align-items-center justify-content-center text-center py-4 my-auto">
            <div class="wm-avatar-profile-ring mb-3">
              <div class="wm-avatar-inner d-flex align-items-center justify-content-center">
                <span class="wm-avatar-initial">${escapeHtml(initial)}</span>
              </div>
              <div class="wm-avatar-badge-star">
                <i class="bi bi-star-fill"></i>
              </div>
            </div>
            <h4 class="fw-bold text-dark mb-1" style="font-size: 1.18rem; letter-spacing: -0.2px;">${escapeHtml(winner.name)}</h4>
            ${deptYearStr ? `<p class="wm-dept-tag mb-3 d-flex align-items-center justify-content-center gap-2"><i class="bi bi-mortarboard-fill text-primary" style="font-size: 1.05rem;"></i><span>${escapeHtml(deptYearStr)}</span></p>` : ''}
            <span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill px-3 py-2 d-inline-flex align-items-center gap-1.5" style="font-size: 9.5px; font-weight: 800; letter-spacing: 0.8px;">
              <i class="bi bi-trophy-fill text-warning"></i> <span>INDIVIDUAL WINNER</span>
            </span>
          </div>
        `;
      } else {
        membersContainer.innerHTML = winner.members.map((m, idx) => `
          <div class="wm-member-item d-flex align-items-center justify-content-between ${idx < winner.members.length - 1 ? 'border-bottom border-light-subtle' : ''}">
            <div class="d-flex align-items-center flex-grow-1 min-w-0 me-3">
              <div class="wm-avatar-micro rounded-circle d-flex align-items-center justify-content-center me-3 ${idx === 0 ? 'bg-primary text-white shadow-sm' : 'bg-light text-primary border'}" style="width: 30px; height: 30px; font-size: 11px; flex-shrink: 0;">
                ${idx === 0 ? '<i class="bi bi-star-fill" style="font-size:10px;"></i>' : '<i class="bi bi-person-fill" style="font-size:11px;"></i>'}
              </div>
              <span class="fw-bold text-dark text-truncate" style="font-size: 13.5px; line-height: 1.25;">${escapeHtml(m)}</span>
            </div>
            ${idx === 0 ? '<span class="badge bg-primary-subtle text-primary border border-primary-subtle rounded-pill" style="font-size: 9px; font-weight: 800; letter-spacing: 0.5px; padding: 4px 8px; flex-shrink: 0; white-space: nowrap;">TEAM LEAD</span>' : '<span class="text-subtle" style="font-size: 11px; font-weight: 500; flex-shrink: 0;">Member</span>'}
          </div>
        `).join("");
      }
    }

    const deptYear = document.getElementById("wmDeptYear");
    if (deptYear) {
      deptYear.textContent = [winner.department, winner.year].filter(Boolean).join(" · ");
    }

    // Action Link
    const projectLink = document.getElementById("wmProjectLink");
    if (projectLink) {
      if (winner.projectUrl) {
        projectLink.href = winner.projectUrl;
        projectLink.style.display = "inline-flex";
      } else {
        projectLink.href = "#";
        projectLink.style.display = "none";
      }
    }

    // Show Modal & Reset Scroll
    modal.classList.add("is-active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const modalBody = modal.querySelector(".wm-landscape-body");
    if (modalBody) modalBody.scrollTop = 0;
    if (window.lenis) {
      try { window.lenis.stop(); } catch (err) {}
    }
  }

  function closeWinnerModal() {
    if (!modal) return;
    modal.classList.remove("is-active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (window.lenis) {
      try { window.lenis.start(); } catch (err) {}
    }
  }

  if (closeBtn) closeBtn.addEventListener("click", closeWinnerModal);
  if (backdrop) backdrop.addEventListener("click", closeWinnerModal);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-active")) {
      closeWinnerModal();
    }
  });
}

loadWinners();
