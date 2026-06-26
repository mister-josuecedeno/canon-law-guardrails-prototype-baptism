import test from "node:test";
import assert from "node:assert/strict";
import { buildDraftCertificatePreview, generateFinalCertificate } from "../src/certificate.js";
import { validateBaptismRecord } from "../src/validation.js";
import { validRecord } from "../src/sampleData.js";

function clone(value) { return structuredClone(value); }
function expectBlocked(record, code) {
  const validation = validateBaptismRecord(record);
  assert.equal(validation.canGenerateFinalCertificate, false);
  assert.ok(validation.blockingErrors.some((message) => message.code === code), "Expected blocking code " + code);
  assert.throws(() => generateFinalCertificate(record), /Final certificate generation is blocked/);
  const preview = buildDraftCertificatePreview(record);
  assert.equal(preview.state, "DRAFT");
  assert.equal(preview.validation.canGenerateFinalCertificate, false);
  assert.equal(preview.canonicalGroups.sponsors.some((participant) => participant.role !== "SPONSOR_GODPARENT"), false);
  assert.equal(preview.canonicalGroups.christianWitnesses.some((participant) => participant.role !== "CHRISTIAN_WITNESS"), false);
  assert.equal(preview.canonicalGroups.witnesses.some((participant) => participant.role !== "WITNESS"), false);
}

test("valid record can generate final certificate", () => {
  const record = clone(validRecord);
  const validation = validateBaptismRecord(record);
  assert.equal(validation.canGenerateFinalCertificate, true);
  const finalCertificate = generateFinalCertificate(record);
  assert.equal(finalCertificate.state, "FINAL");
  assert.equal(finalCertificate.displaysAdoptionInformation, false);
});

test("non-Catholic entered as Sponsor/Godparent is blocked", () => {
  const record = clone(validRecord);
  record.participants[0].religionStatus = "BAPTIZED_NON_CATHOLIC_CHRISTIAN";
  expectBlocked(record, "SPONSOR_NOT_CATHOLIC");
});

test("parent entered as Sponsor/Godparent is blocked", () => {
  const record = clone(validRecord);
  record.participants[0].isParentOrLegalGuardian = true;
  expectBlocked(record, "SPONSOR_IS_PARENT_OR_GUARDIAN");
});

test("Christian Witness without Catholic Sponsor/Godparent is blocked", () => {
  const record = clone(validRecord);
  record.participants = record.participants.filter((participant) => participant.role !== "SPONSOR_GODPARENT");
  expectBlocked(record, "CHRISTIAN_WITNESS_WITHOUT_CATHOLIC_SPONSOR");
});

test("Christian Witness printed under Sponsors is blocked", () => {
  const record = clone(validRecord);
  record.participants[1].printedUnderSponsors = true;
  expectBlocked(record, "CHRISTIAN_WITNESS_PRINTED_UNDER_SPONSORS");
});

test("Witness printed under Sponsors is blocked", () => {
  const record = clone(validRecord);
  record.participants[2].printedUnderSponsors = true;
  expectBlocked(record, "WITNESS_PRINTED_UNDER_SPONSORS");
});

test("more than two Sponsors/Godparents is blocked", () => {
  const record = clone(validRecord);
  record.participants.push({ ...record.participants[0], id: "p4", name: "Carlos" }, { ...record.participants[0], id: "p5", name: "Elena" });
  expectBlocked(record, "MORE_THAN_TWO_SPONSORS");
});

test("Sponsor/Godparent missing required Catholic qualifications is blocked", () => {
  const record = clone(validRecord);
  record.participants[0].confirmedCatholic = false;
  expectBlocked(record, "SPONSOR_MISSING_CONFIRMED_CATHOLIC");
});

test("generic participant role is blocked", () => {
  const record = clone(validRecord);
  record.participants[0].role = "PARTICIPANT";
  expectBlocked(record, "GENERIC_PARTICIPANT_ROLE");
});

test("adoption context revealing adoption on public certificate is blocked", () => {
  const record = clone(validRecord);
  record.adoptionRelated = true;
  record.publicCertificateIncludesAdoptionInfo = true;
  expectBlocked(record, "ADOPTION_INFO_ON_PUBLIC_CERTIFICATE");
});

test("adoption context requiring suppressed participant names is blocked when names are printable", () => {
  const record = clone(validRecord);
  record.adoptionRelated = true;
  record.certificateContext = "ADOPTION_RESTRICTED_SUPPRESS_PARTICIPANTS";
  record.publicCertificateSuppressParticipantNames = false;
  expectBlocked(record, "ADOPTION_PARTICIPANT_NAMES_NOT_SUPPRESSED");
});
