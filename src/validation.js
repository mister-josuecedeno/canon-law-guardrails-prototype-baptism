import "./types.js";

const sponsorQualificationChecks = [
  ["baptizedCatholic", "SPONSOR_MISSING_BAPTIZED_CATHOLIC", "Baptized Catholic"],
  ["confirmedCatholic", "SPONSOR_MISSING_CONFIRMED_CATHOLIC", "Confirmed Catholic"],
  ["receivedEucharist", "SPONSOR_MISSING_EUCHARIST", "Received Eucharist"],
  ["inGoodStanding", "SPONSOR_MISSING_GOOD_STANDING", "In good standing / not under canonical penalty"],
  ["meetsMinimumAge", "SPONSOR_MISSING_MINIMUM_AGE", "Meets minimum age or has exception granted"]
];

export function validateBaptismRecord(record) {
  const blockingErrors = [];
  const warnings = [];
  const infoMessages = [
    info("INFO_SPONSOR_ROLE", "A Sponsor/Godparent is a Catholic participant fulfilling the canonical sponsor role."),
    info("INFO_CHRISTIAN_WITNESS_ROLE", "A Christian Witness is a baptized non-Catholic Christian and must not be labeled as Sponsor/Godparent."),
    info("INFO_WITNESS_ROLE", "A Witness attests to the baptism and must not be labeled as Sponsor/Godparent."),
    info("INFO_REGISTER_DISTINCTION", "The baptismal register distinguishes sponsors from witnesses, so the certificate must preserve the distinction.")
  ];
  const participants = record.participants ?? [];
  const sponsors = participants.filter((participant) => participant.role === "SPONSOR_GODPARENT");
  const catholicSponsors = sponsors.filter((participant) => participant.religionStatus === "CATHOLIC");
  const christianWitnesses = participants.filter((participant) => participant.role === "CHRISTIAN_WITNESS");
  const witnesses = participants.filter((participant) => participant.role === "WITNESS");
  for (const participant of participants) {
    if (participant.role === "PARTICIPANT") blockingErrors.push(blocking("GENERIC_PARTICIPANT_ROLE", "Use an explicit canonical role: Sponsor/Godparent, Christian Witness, or Witness.", participant, ["participants.role"]));
    if (participant.role === "SPONSOR_GODPARENT") validateSponsor(participant, blockingErrors, warnings);
    if (participant.role === "CHRISTIAN_WITNESS") validateChristianWitness(participant, catholicSponsors, blockingErrors);
    if (participant.role === "WITNESS") validateWitness(participant, blockingErrors);
    validatePrintedRolePlacement(participant, blockingErrors);
  }
  if (sponsors.length > 2) blockingErrors.push(blocking("MORE_THAN_TWO_SPONSORS", "No more than two Sponsors/Godparents may be entered.", undefined, ["participants"]));
  if (witnesses.length > 0 && sponsors.length === 0) warnings.push(warning("WITNESS_WITHOUT_SPONSOR", "No Sponsor/Godparent is listed, but a Witness is listed to prove baptism occurred. Diocesan review or policy confirmation may be required.", witnesses.map((participant) => participant.id), ["participants"]));
  if (sponsors.length === 2) {
    const sponsorSexes = sponsors.map((participant) => participant.sex ?? "UNKNOWN");
    if (sponsorSexes.includes("UNKNOWN")) warnings.push(warning("TWO_SPONSORS_SEX_UNKNOWN", "Sponsor/Godparent sex is Unknown/Not specified for one or both sponsors. Diocesan review or policy confirmation may be required.", sponsors.map((participant) => participant.id), ["participants.sex"]));
    else if (!(sponsorSexes.includes("MALE") && sponsorSexes.includes("FEMALE"))) warnings.push(warning("TWO_SPONSORS_NOT_MALE_AND_FEMALE", "Two Sponsors/Godparents are listed, but they are not one male and one female. Diocesan review or policy confirmation may be required.", sponsors.map((participant) => participant.id), ["participants.sex"]));
  }
  for (const fieldName of record.missingDiocesanFields ?? []) warnings.push(warning("MISSING_DIOCESAN_FIELD", "A field required by a specific diocese or template is missing: " + fieldName + ". Universal canon-law validation otherwise passes.", undefined, [fieldName]));
  if (sponsors.length === 0) warnings.push(warning("SPONSOR_SECTION_HIDDEN", "The Sponsor/Godparent certificate section is hidden because no valid participants exist for that section.", undefined, ["participants"]));
  if (christianWitnesses.length === 0) warnings.push(warning("CHRISTIAN_WITNESS_SECTION_HIDDEN", "The Christian Witness certificate section is hidden because no valid participants exist for that section.", undefined, ["participants"]));
  if (witnesses.length === 0) warnings.push(warning("WITNESS_SECTION_HIDDEN", "The Witness certificate section is hidden because no valid participants exist for that section.", undefined, ["participants"]));
  validateAdoptionContext(record, blockingErrors);
  return { canGenerateFinalCertificate: blockingErrors.length === 0, blockingErrors, warnings, infoMessages };
}

function validateSponsor(participant, blockingErrors, warnings) {
  if (participant.religionStatus !== "CATHOLIC") blockingErrors.push(blocking("SPONSOR_NOT_CATHOLIC", "A Sponsor/Godparent must be Catholic.", participant, ["participants.religionStatus"]));
  if (participant.isParentOrLegalGuardian) blockingErrors.push(blocking("SPONSOR_IS_PARENT_OR_GUARDIAN", "A Sponsor/Godparent cannot be the father, mother, parent, or legal guardian of the baptized person.", participant, ["participants.isParentOrLegalGuardian"]));
  if (participant.religionStatus === "OTHER_UNKNOWN") blockingErrors.push(blocking("SPONSOR_OTHER_UNKNOWN_STATUS", "A participant with Other/Unknown religion or status cannot be printed as Sponsor/Godparent.", participant, ["participants.religionStatus"]));
  for (const [field, code, label] of sponsorQualificationChecks) {
    if (field === "meetsMinimumAge" && participant.ageExceptionGranted) {
      warnings.push(warning("SPONSOR_AGE_EXCEPTION_GRANTED", "Sponsor/Godparent age exception is marked as granted. Diocesan review or policy confirmation may be required.", [participant.id], ["participants.ageExceptionGranted"]));
      continue;
    }
    if (!participant[field]) blockingErrors.push(blocking(code, "Sponsor/Godparent is missing required Catholic sponsor qualification: " + label + ".", participant, ["participants." + field]));
  }
}

function validateChristianWitness(participant, catholicSponsors, blockingErrors) {
  if (participant.religionStatus === "CATHOLIC") blockingErrors.push(blocking("CATHOLIC_CLASSIFIED_AS_CHRISTIAN_WITNESS", "A Catholic participant must be classified as Sponsor/Godparent, not Christian Witness.", participant, ["participants.role"]));
  if (participant.religionStatus !== "BAPTIZED_NON_CATHOLIC_CHRISTIAN" || !participant.baptizedNonCatholicChristian) blockingErrors.push(blocking("CHRISTIAN_WITNESS_NOT_BAPTIZED_NON_CATHOLIC", "A Christian Witness must be marked as a baptized non-Catholic Christian.", participant, ["participants.religionStatus", "participants.baptizedNonCatholicChristian"]));
  if (catholicSponsors.length === 0) blockingErrors.push(blocking("CHRISTIAN_WITNESS_WITHOUT_CATHOLIC_SPONSOR", "A Christian Witness cannot be entered without at least one Catholic Sponsor/Godparent.", participant, ["participants.role"]));
}

function validateWitness(participant, blockingErrors) {
  if (participant.treatedAsEquivalentToSponsor) blockingErrors.push(blocking("WITNESS_TREATED_AS_SPONSOR", "A Witness must not be treated as equivalent to Sponsor/Godparent.", participant, ["participants.treatedAsEquivalentToSponsor"]));
}

function validatePrintedRolePlacement(participant, blockingErrors) {
  if (participant.printedUnderSponsors && participant.role === "CHRISTIAN_WITNESS") blockingErrors.push(blocking("CHRISTIAN_WITNESS_PRINTED_UNDER_SPONSORS", "A Christian Witness must not be printed under Sponsor/Godparent.", participant, ["participants.printedUnderSponsors"]));
  if (participant.printedUnderSponsors && participant.role === "WITNESS") blockingErrors.push(blocking("WITNESS_PRINTED_UNDER_SPONSORS", "A Witness must not be printed under Sponsor/Godparent.", participant, ["participants.printedUnderSponsors"]));
  if (participant.printedUnderSponsors && participant.role === "PARTICIPANT") blockingErrors.push(blocking("PARTICIPANT_PRINTED_UNDER_SPONSORS", "A generic participant must not be printed under Sponsor/Godparent.", participant, ["participants.printedUnderSponsors"]));
}

function validateAdoptionContext(record, blockingErrors) {
  if (!record.adoptionRelated) return;
  if (record.publicCertificateIncludesAdoptionInfo) blockingErrors.push(blocking("ADOPTION_INFO_ON_PUBLIC_CERTIFICATE", "Adoption-related certificate context must not display adoption information on the public certificate.", undefined, ["publicCertificateIncludesAdoptionInfo"]));
  if (record.certificateContext === "ADOPTION_RESTRICTED_SUPPRESS_PARTICIPANTS" && !record.publicCertificateSuppressParticipantNames) blockingErrors.push(blocking("ADOPTION_PARTICIPANT_NAMES_NOT_SUPPRESSED", "This adoption-related certificate context requires participant names to be suppressed.", undefined, ["publicCertificateSuppressParticipantNames"]));
}
function blocking(code, message, participant, affectedFields) { return { severity: "BLOCKING_ERROR", code, message, participantIds: participant ? [participant.id] : undefined, affectedFields }; }
function warning(code, message, participantIds, affectedFields) { return { severity: "WARNING", code, message, participantIds, affectedFields }; }
function info(code, message) { return { severity: "INFO", code, message }; }
