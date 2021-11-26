import jsonpath from "jsonpath";
import { mappingKeys } from "../mapping/mappings";

export const extractFhirPatientData = (patient) => {
  let identifier;
  jsonpath.query(patient, "$.identifier.*").forEach((ident) => {
    if (["urn:oid:2.16.578.1.12.4.1.4.1", "urn:oid:2.16.578.1.12.4.1.4.2"].includes(ident.system)) {
      identifier = ident.value;
    }
  });
  const familyName = jsonpath.query(patient, "$.name[0].family")[0];
  const givenName = jsonpath.query(patient, "$.name[0].given.*").join(" ");
  return {
    [mappingKeys.FODSELSNUMMER]: identifier,
    [mappingKeys.FAMILY_NAME]: familyName,
    [mappingKeys.GIVEN_NAME]: givenName,
  };
};

export const extractFhirUserData = (user) => {
  const fodselsNr = jsonpath.query(user, '$.identifier[?(@.system=="urn:oid:2.16.578.1.12.4.1.4.1")].value')[0];
  const hrpNummer = jsonpath.query(user, '$.identifier[?(@.system=="urn:oid:2.16.578.1.12.4.1.4.4")].value')[0];
  const familyName = jsonpath.query(user, "$.name[0].family")[0];
  const givenName = jsonpath.query(user, "$.name[0].given.*").join(" ");
  const phoneNumber = jsonpath.query(user, '$.telecom[?(@.system=="phone")].value')[0];
  const email = jsonpath.query(user, '$.telecom[?(@.system=="email")].value')[0];
  return {
    [mappingKeys.FODSELSNUMMER]: fodselsNr,
    [mappingKeys.FAMILY_NAME]: familyName,
    [mappingKeys.GIVEN_NAME]: givenName,
    [mappingKeys.HPR_NR]: hrpNummer,
    [mappingKeys.PHONE]: phoneNumber,
    [mappingKeys.EMAIL]: email,
  };
};
