import { extractFhirPatientData, extractFhirUserData } from "./extract-fhir-data";
import patients from "../../example_data/data/Patients.json";
import practitioners from "../../example_data/data/Practitioners.json";

it("should parse patient fhir", () => {
  patients.forEach((patient) => {
    const patientData = extractFhirPatientData(patient);
    console.log(patientData);
  });

  expect(true).toEqual(true);
});

it("should parse user fhir", () => {
  practitioners.forEach((practitioner) => {
    const userData = extractFhirUserData(practitioner.resource);
    console.log(userData);
  });

  expect(true).toEqual(true);
});
