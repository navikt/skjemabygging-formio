import { NavFormType } from "@navikt/skjemadigitalisering-shared-domain";

export type UpdateFormFunction = (form: NavFormType) => void;
export type FormMetadataError = { [key: string]: string };

export const validateFormMetadata = (form: NavFormType) => {
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
  return errors;
};

export const isFormMetadataValid = (errors) => Object.keys(errors).length === 0;
