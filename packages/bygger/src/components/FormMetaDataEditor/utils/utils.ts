import { DeclarationType, Form, UsageContext, numberUtils } from '@navikt/skjemadigitalisering-shared-domain';

export type UpdateFormFunction = (form: Form) => void;
export type FormMetadataErrorKeys =
  | 'title'
  | 'skjemanummer'
  | 'tema'
  | 'submissionTypes'
  | 'additionalSubmissionTypes'
  | 'lockedFormReason'
  | 'declarationText'
  | 'uxSignalsId'
  | 'uxSignalsInnsending'
  | 'mellomlagringDurationDays';
export type FormMetadataError = Partial<{ [key in FormMetadataErrorKeys]: string }>;

export const validateFormMetadata = (form: Form, usageContext: UsageContext) => {
  const errors: FormMetadataError = {};

  if (!form.title) {
    errors.title = 'Du må oppgi skjematittel';
  }
  if (!form.skjemanummer) {
    errors.skjemanummer = 'Du må oppgi skjemanummer';
  }
  if (!form.properties.tema) {
    errors.tema = 'Du må velge ett tema';
  }

  if (form.skjemanummer.length > 20) {
    errors.skjemanummer = 'Skjemanummeret kan ikke være lengre enn 20 tegn';
  }

  if (!!form.lock && !form.lock.reason) {
    errors.lockedFormReason = 'Du må oppgi en grunn for at skjemaet er låst';
  }

  // Some fields are only required in edit mode
  if (usageContext === 'edit') {
    if (form.properties.declarationType === DeclarationType.custom && !form.properties.declarationText) {
      errors.declarationText = 'Du må lage en tilpasset erklæringstekst';
    }
    if (
      !form.properties.mellomlagringDurationDays ||
      !numberUtils.isValidInteger(form.properties.mellomlagringDurationDays)
    ) {
      errors.mellomlagringDurationDays = 'Mellomlagringstiden må være et heltall';
    }
  }

  return errors;
};

export const isFormMetadataValid = (errors) => Object.keys(errors).length === 0;
