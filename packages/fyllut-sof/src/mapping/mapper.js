import { findComponents } from "../utils/find-components";
import { extractFhirPatientData, extractFhirUserData } from "../utils/extract-fhir-data";
import { patientMappings, practitionerMappings } from "./mappings";

export const mapper = (form, patient, practitioner) => {
  const formCopy = Object.assign({}, form);
  const components = findComponents(formCopy.components);
  console.log(components.map((component) => component.id + " " + component.key + " " + component.defaultValue));
  const patientData = extractFhirPatientData(patient);
  const userData = extractFhirUserData(practitioner);
  components.forEach((component) => {
    const patientKeyOrId = patientMappings[component.key] || patientMappings[component.id];
    if (patientKeyOrId && patientData[patientKeyOrId]) {
      component.defaultValue = patientData[patientKeyOrId];
      component.disabled = true;
    }
    const practitionerKeyOrId = practitionerMappings[component.key] || practitionerMappings[component.id];
    if (practitionerKeyOrId && userData[practitionerKeyOrId]) {
      component.defaultValue = userData[practitionerKeyOrId];
      component.disabled = true;
    }
  });
  return formCopy;
};
