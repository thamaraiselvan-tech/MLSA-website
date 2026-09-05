// AI Startup Arena - team submission form logic.
// Sends team details + PPT/PDF file to the Apps Script handler, which emails it.

const SUBMISSION_ENDPOINT = "https://script.google.com/macros/s/AKfycbysd-6hprMLK1Nz05EjVaBtVRJA1NUIX0tGJQtvnHhMsQsft6nYA1Vp_NHZwE4uVuFYCQ/exec";
const MAX_FILE_MB = 20; // safety margin under Apps Script's 25MB email attachment cap
const SUBMISSIONS_OPEN = false;              // set to false to close submissions immediately
const SUBMISSION_DEADLINE = "";              // e.g. "2026-08-10T23:59" to auto-close at that time, or "" for no deadline

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result looks like "data:application/vnd.ms-powerpoint;base64,AAAA..."
      // we only want the part after the comma.
      const base64 = reader.result.split(",")[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function isSubmissionClosed() {
  if (!SUBMISSIONS_OPEN) return true;
  if (SUBMISSION_DEADLINE && new Date(SUBMISSION_DEADLINE) < new Date()) return true;
  return false;
}

function initSubmissionForm() {
  const form = document.getElementById("submissionForm");
  if (!form) return; // form isn't on this page, nothing to do

  if (isSubmissionClosed()) {
    form.classList.add("d-none");
    document.getElementById("submissionClosedMsg").classList.remove("d-none");
    return;
  }

  const statusEl = document.getElementById("submissionStatus");
  const submitBtn = document.getElementById("submissionSubmitBtn");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    statusEl.className = "small mt-2";
    statusEl.textContent = "";

    const fileInput = document.getElementById("submissionFile");
    const file = fileInput.files[0];

    if (!file) {
      statusEl.textContent = "Please attach your team's PPT or PDF.";
      statusEl.classList.add("text-fluent-error");
      return;
    }

    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_MB) {
      statusEl.textContent = `That file is ${sizeMB.toFixed(1)}MB - please keep it under ${MAX_FILE_MB}MB.`;
      statusEl.classList.add("text-fluent-error");
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Uploading…";

    try {
      const payload = {
        teamName: form.elements.teamName.value,
        leadName: form.elements.leadName.value,
        leadDept: form.elements.leadDept.value,
        leadYear: form.elements.leadYear.value,
        leadSection: form.elements.leadSection.value,
        member1Name: form.elements.member1Name.value,
        member1Dept: form.elements.member1Dept.value,
        member1Year: form.elements.member1Year.value,
        member1Section: form.elements.member1Section.value,
        member2Name: form.elements.member2Name.value,
        member2Dept: form.elements.member2Dept.value,
        member2Year: form.elements.member2Year.value,
        member2Section: form.elements.member2Section.value,
        member3Name: form.elements.member3Name.value,
        member3Dept: form.elements.member3Dept.value,
        member3Year: form.elements.member3Year.value,
        member3Section: form.elements.member3Section.value,
        fileData: await fileToBase64(file),
        fileName: file.name,
        mimeType: file.type,
      };

      const res = await fetch(SUBMISSION_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      });
      const result = await res.json();

      if (result.status === "success") {
        form.classList.add("d-none");
        statusEl.textContent = "Submitted! We've received your team's entry.";
        statusEl.classList.add("text-fluent-success");
      } else {
        throw new Error(result.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      statusEl.textContent = err.message || "Could not submit right now. Please try again shortly.";
      statusEl.classList.add("text-fluent-error");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit entry";
    }
  });
}

initSubmissionForm();
