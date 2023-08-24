import { DeclarationType, NavFormType, UsageContext } from "@navikt/skjemadigitalisering-shared-domain";

export type UpdateFormFunction = (form: NavFormType) => void;
export type FormMetadataError = { [key: string]: string };

export const validateFormMetadata = (form: NavFormType, usageContext: UsageContext) => {
  const errors = {} as FormMetadataError;
  if (!form.title) {
    errors.title = "Du må oppgi skjematittel";
  }
  if (!form.properties.skjemanummer) {
    errors.skjemanummer = "Du må oppgi skjemanummer";
  }
  if (!form.properties.tema) {
    errors.tema = "Du må velge ett tema";
  }

  // Some fields are only required in edit mode
  if (usageContext === "edit") {
    if (!form.properties.ettersending) {
      errors.ettersending = "Du må velge innsendingstype for ettersending";
    }
    if (form.properties.declarationType === DeclarationType.custom && !form.properties.declarationText) {
      errors.declarationText = "Du må lage en tilpasset erklæringstekst";
    }
  }

  return errors;
};

export const isFormMetadataValid = (errors) => Object.keys(errors).length === 0;
