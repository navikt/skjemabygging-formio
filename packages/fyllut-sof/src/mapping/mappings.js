export const mappingKeys = {
  EMAIL: "email",
  FAMILY_NAME: "familyName",
  FODSELSNUMMER: "identifier",
  GIVEN_NAME: "givenName",
  HPR_NR: "hprNr",
  PHONE: "phone",
};

export const patientMappings = {
  etternavnSoker: mappingKeys.FAMILY_NAME,
  fodselsnummerDNummer: mappingKeys.FODSELSNUMMER,
  fodselsnummerDNummerSoker: mappingKeys.FODSELSNUMMER,
  fornavnSoker: mappingKeys.GIVEN_NAME,
};

export const practitionerMappings = {
  e4v3on: mappingKeys.GIVEN_NAME,
  e6k4qko: mappingKeys.PHONE,
  eax3vwm: mappingKeys.GIVEN_NAME,
  eqnu0cg: mappingKeys.FAMILY_NAME,
  erbqtxa: mappingKeys.PHONE,
  erxmc5m: mappingKeys.EMAIL,
  eylknri: mappingKeys.FAMILY_NAME,
};
