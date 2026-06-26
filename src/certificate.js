import "./types.js";
import { validateBaptismRecord } from "./validation.js";

export function buildDraftCertificatePreview(record) {
  return buildPreview(record, "DRAFT");
}

export function generateFinalCertificate(record) {
  const validation = validateBaptismRecord(record);
  if (!validation.canGenerateFinalCertificate) {
    const error = new Error("Final certificate generation is blocked because one or more participants are assigned to a role that conflicts with Catholic canon-law requirements.");
    error.name = "CertificateGenerationBlockedError";
    error.validation = validation;
    throw error;
  }
  return buildPreview(record, "FINAL", validation);
}

function buildPreview(record, state, validation = validateBaptismRecord(record)) {
  const suppressNames = Boolean(record.adoptionRelated && record.certificateContext === "ADOPTION_RESTRICTED_SUPPRESS_PARTICIPANTS" && record.publicCertificateSuppressParticipantNames);
  return {
    state,
    title: (state === "DRAFT" ? "Draft only: " : "") + "Baptismal Certificate",
    canonicalGroups: {
      sponsors: safeParticipants(record, "SPONSOR_GODPARENT", suppressNames),
      christianWitnesses: safeParticipants(record, "CHRISTIAN_WITNESS", suppressNames),
      witnesses: safeParticipants(record, "WITNESS", suppressNames)
    },
    validation,
    participantNamesSuppressed: suppressNames,
    displaysAdoptionInformation: false
  };
}

function safeParticipants(record, role, suppressNames) {
  return (record.participants ?? [])
    .filter((participant) => participant.role === role)
    .map((participant) => ({ ...participant, name: suppressNames ? "[suppressed]" : participant.name, printedUnderSponsors: role === "SPONSOR_GODPARENT" }));
}
