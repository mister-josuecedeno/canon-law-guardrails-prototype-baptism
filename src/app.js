import { buildDraftCertificatePreview, generateFinalCertificate } from "./certificate.js";
import { blockedRecord, validRecord } from "./sampleData.js";
import { validateBaptismRecord } from "./validation.js";

const state = { record: structuredClone(blockedRecord) };
const form = document.querySelector("#recordForm");
const messagePanel = document.querySelector("#messagePanel");
const previewPanel = document.querySelector("#previewPanel");
const finalButton = document.querySelector("#finalButton");
const finalStatus = document.querySelector("#finalStatus");
const scenarioSelect = document.querySelector("#scenarioSelect");

scenarioSelect.addEventListener("change", () => {
  state.record = scenarioSelect.value === "valid" ? structuredClone(validRecord) : structuredClone(blockedRecord);
  renderForm();
  render();
});

form.addEventListener("input", (event) => {
  const target = event.target;
  const participant = state.record.participants.find((item) => item.id === target.dataset.participantId);
  if (!participant) return;
  participant[target.name] = target.type === "checkbox" ? target.checked : target.value;
  render();
});

finalButton.addEventListener("click", () => {
  try {
    const finalCertificate = generateFinalCertificate(state.record);
    finalStatus.textContent = "Final certificate generated with " + finalCertificate.canonicalGroups.sponsors.length + " sponsor section entry" + (finalCertificate.canonicalGroups.sponsors.length === 1 ? "" : "ies") + ".";
    finalStatus.className = "status success";
  } catch (error) {
    finalStatus.textContent = error.message;
    finalStatus.className = "status danger";
  }
});

function renderForm() {
  form.innerHTML = state.record.participants.map((participant) =>
    '<fieldset id="participant-' + participant.id + '">' +
      '<legend>' + participant.name + '</legend>' +
      '<label>Canonical role<select name="role" data-participant-id="' + participant.id + '">' + option("SPONSOR_GODPARENT", "Sponsor/Godparent", participant.role) + option("CHRISTIAN_WITNESS", "Christian Witness", participant.role) + option("WITNESS", "Witness", participant.role) + option("PARTICIPANT", "Generic participant", participant.role) + '</select></label>' +
      '<label>Religion/status<select name="religionStatus" data-participant-id="' + participant.id + '">' + option("CATHOLIC", "Catholic", participant.religionStatus) + option("BAPTIZED_NON_CATHOLIC_CHRISTIAN", "Baptized non-Catholic Christian", participant.religionStatus) + option("NON_CHRISTIAN", "Non-Christian", participant.religionStatus) + option("OTHER_UNKNOWN", "Other/Unknown", participant.religionStatus) + '</select></label>' +
      checkbox(participant, "printedUnderSponsors", "Printed under Sponsor/Godparent") +
      checkbox(participant, "isParentOrLegalGuardian", "Parent or legal guardian") +
      checkbox(participant, "baptizedCatholic", "Baptized Catholic") +
      checkbox(participant, "confirmedCatholic", "Confirmed Catholic") +
      checkbox(participant, "receivedEucharist", "Received Eucharist") +
      checkbox(participant, "inGoodStanding", "In good standing") +
      checkbox(participant, "meetsMinimumAge", "Meets minimum age") +
      checkbox(participant, "ageExceptionGranted", "Age exception granted") +
      checkbox(participant, "baptizedNonCatholicChristian", "Baptized non-Catholic Christian") +
      checkbox(participant, "treatedAsEquivalentToSponsor", "Treated as equivalent to Sponsor/Godparent") +
    '</fieldset>'
  ).join("");
}
function render() {
  const validation = validateBaptismRecord(state.record);
  const draftPreview = buildDraftCertificatePreview(state.record);
  finalButton.disabled = !validation.canGenerateFinalCertificate;
  finalStatus.textContent = validation.canGenerateFinalCertificate ? "Final certificate generation is allowed." : "Final certificate generation is blocked because one or more participants are assigned to a role that conflicts with Catholic canon-law requirements.";
  finalStatus.className = validation.canGenerateFinalCertificate ? "status success" : "status danger";
  messagePanel.innerHTML = messageGroup("Blocking errors", validation.blockingErrors, "danger") + messageGroup("Warnings", validation.warnings, "warning") + messageGroup("Information", validation.infoMessages, "info");
  previewPanel.innerHTML = '<div class="draftBadge">Draft only</div><h2>' + draftPreview.title + '</h2><p>' + (validation.canGenerateFinalCertificate ? "Certificate generation is not blocked." : "Certificate generation is blocked.") + '</p>' + previewSection("Sponsors/Godparents", draftPreview.canonicalGroups.sponsors) + previewSection("Christian Witnesses", draftPreview.canonicalGroups.christianWitnesses) + previewSection("Witnesses", draftPreview.canonicalGroups.witnesses);
}
function messageGroup(title, items, tone) { return '<section class="messageGroup ' + tone + '"><h2>' + title + '</h2>' + messages(items) + '</section>'; }
function messages(items) { return items.length === 0 ? '<p class="empty">None</p>' : '<ul>' + items.map((item) => '<li><strong>' + item.code + '</strong><span>' + item.message + '</span>' + fieldLinks(item) + '</li>').join("") + '</ul>'; }
function fieldLinks(item) { return item.participantIds?.length ? '<div class="fieldLinks">' + item.participantIds.map((id) => '<a href="#participant-' + id + '">Review fields</a>').join("") + '</div>' : ""; }
function previewSection(title, participants) { return participants.length === 0 ? '<section><h3>' + title + '</h3><p class="empty">Hidden because no valid participants exist for this section.</p></section>' : '<section><h3>' + title + '</h3><ul>' + participants.map((participant) => '<li>' + participant.name + '</li>').join("") + '</ul></section>'; }
function option(value, label, selectedValue) { return '<option value="' + value + '" ' + (selectedValue === value ? "selected" : "") + '>' + label + '</option>'; }
function checkbox(participant, name, label) { return '<label><input type="checkbox" name="' + name + '" data-participant-id="' + participant.id + '" ' + (participant[name] ? "checked" : "") + '> ' + label + '</label>'; }
renderForm();
render();
