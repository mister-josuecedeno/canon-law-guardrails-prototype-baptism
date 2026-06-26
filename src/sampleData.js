export const validRecord = {
  baptizedPersonName: "Maria Elena Rivera",
  certificateContext: "PUBLIC_STANDARD",
  adoptionRelated: false,
  publicCertificateIncludesAdoptionInfo: false,
  publicCertificateSuppressParticipantNames: false,
  missingDiocesanFields: [],
  participants: [
    { id: "p1", name: "Ana Martinez", role: "SPONSOR_GODPARENT", religionStatus: "CATHOLIC", sex: "FEMALE", isParentOrLegalGuardian: false, printedUnderSponsors: true, baptizedCatholic: true, confirmedCatholic: true, receivedEucharist: true, inGoodStanding: true, meetsMinimumAge: true, ageExceptionGranted: false },
    { id: "p2", name: "Thomas Reed", role: "CHRISTIAN_WITNESS", religionStatus: "BAPTIZED_NON_CATHOLIC_CHRISTIAN", sex: "MALE", baptizedNonCatholicChristian: true, printedUnderSponsors: false },
    { id: "p3", name: "Clerk witness", role: "WITNESS", religionStatus: "OTHER_UNKNOWN", sex: "UNKNOWN", printedUnderSponsors: false, treatedAsEquivalentToSponsor: false }
  ]
};
export const blockedRecord = { ...validRecord, participants: [ { ...validRecord.participants[0], religionStatus: "OTHER_UNKNOWN", baptizedCatholic: false }, { ...validRecord.participants[1], printedUnderSponsors: true } ] };
