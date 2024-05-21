import { DeclarationType, NavFormType, UsageContext } from '@navikt/skjemadigitalisering-shared-domain';

export type UpdateFormFunction = (form: NavFormType) => void;
export type FormMetadataErrorKeys =
  | 'title'
  | 'skjemanummer'
  | 'tema'
  | 'innsending'
  | 'ettersending'
  | 'lockedFormReason'
  | 'declarationText'
  | 'uxSignalsId'
  | 'uxSignalsInnsending';
export type FormMetadataError = Partial<{ [key in FormMetadataErrorKeys]: string }>;

export const validateFormMetadata = (form: NavFormType, usageContext: UsageContext) => {
  const errors: FormMetadataError = {};

  if (!form.title) {
    errors.title = 'Du må oppgi skjematittel';
  }
  if (!form.properties.skjemanummer) {
    errors.skjemanummer = 'Du må oppgi skjemanummer';
  }
  if (!form.properties.tema) {
    errors.tema = 'Du må velge ett tema';
  }

  if (form.properties.skjemanummer.length > 20) {
    errors.skjemanummer = 'Skjemanummeret kan ikke være lengre enn 20 tegn';
  }

  if (form.properties.isLockedForm && !form.properties.lockedFormReason) {
    errors.lockedFormReason = 'Du må oppgi en grunn for at skjemaet er låst';
  }

  // Some fields are only required in edit mode
  if (usageContext === 'edit') {
    if (!form.properties.innsending) {
      errors.innsending = 'Du må velge innsendingstype';
    }
    if (!form.properties.ettersending) {
      errors.ettersending = 'Du må velge innsendingstype for ettersending';
    }
    if (form.properties.declarationType === DeclarationType.custom && !form.properties.declarationText) {
      errors.declarationText = 'Du må lage en tilpasset erklæringstekst';
    }
  }

  return errors;
};

export const isFormMetadataValid = (errors) => Object.keys(errors).length === 0;
