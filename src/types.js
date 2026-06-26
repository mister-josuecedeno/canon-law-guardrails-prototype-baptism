/**
 * @typedef {"SPONSOR_GODPARENT" | "CHRISTIAN_WITNESS" | "WITNESS" | "PARTICIPANT"} ParticipantRole
 * @typedef {"CATHOLIC" | "BAPTIZED_NON_CATHOLIC_CHRISTIAN" | "NON_CHRISTIAN" | "OTHER_UNKNOWN"} ReligionStatus
 * @typedef {"MALE" | "FEMALE" | "UNKNOWN"} Sex
 * @typedef {"PUBLIC_STANDARD" | "ADOPTION_RESTRICTED_SUPPRESS_PARTICIPANTS" | "ADOPTION_PUBLIC_REDIRECT"} CertificateContext
 * @typedef {"BLOCKING_ERROR" | "WARNING" | "INFO"} ValidationSeverity
 * @typedef {Object} Participant
 * @property {string} id
 * @property {string} name
 * @property {ParticipantRole} role
 * @property {ReligionStatus} religionStatus
 * @property {Sex} [sex]
 * @property {boolean} [isParentOrLegalGuardian]
 * @property {boolean} [printedUnderSponsors]
 * @property {boolean} [treatedAsEquivalentToSponsor]
 * @property {boolean} [baptizedCatholic]
 * @property {boolean} [confirmedCatholic]
 * @property {boolean} [receivedEucharist]
 * @property {boolean} [inGoodStanding]
 * @property {boolean} [meetsMinimumAge]
 * @property {boolean} [ageExceptionGranted]
 * @property {boolean} [baptizedNonCatholicChristian]
 * @typedef {Object} BaptismRecord
 * @property {string} baptizedPersonName
 * @property {Participant[]} participants
 * @property {CertificateContext} certificateContext
 * @property {boolean} [adoptionRelated]
 * @property {boolean} [publicCertificateIncludesAdoptionInfo]
 * @property {boolean} [publicCertificateSuppressParticipantNames]
 * @property {string[]} [missingDiocesanFields]
 * @typedef {Object} ValidationMessage
 * @property {ValidationSeverity} severity
 * @property {string} code
 * @property {string} message
 * @property {string[]} [participantIds]
 * @property {string[]} [affectedFields]
 * @typedef {Object} ValidationResult
 * @property {boolean} canGenerateFinalCertificate
 * @property {ValidationMessage[]} blockingErrors
 * @property {ValidationMessage[]} warnings
 * @property {ValidationMessage[]} infoMessages
 * @typedef {Object} CertificatePreviewModel
 * @property {"DRAFT" | "FINAL"} state
 * @property {string} title
 * @property {{sponsors: Participant[], christianWitnesses: Participant[], witnesses: Participant[]}} canonicalGroups
 * @property {ValidationResult} validation
 * @property {boolean} participantNamesSuppressed
 * @property {boolean} displaysAdoptionInformation
 */
export {};
