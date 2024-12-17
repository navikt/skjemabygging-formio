import { FormsApiTranslation } from '@navikt/skjemadigitalisering-shared-domain';

const translationErrorTypes = ['MISSING_KEY_VALIDATION', 'CONFLICT', 'OTHER_HTTP'] as const;
type TranslationError = {
  type: (typeof translationErrorTypes)[number];
  message: string;
  key: string;
  isNewTranslation?: boolean;
};

const isTranslationError = (translationOrError: unknown): translationOrError is TranslationError =>
  translationErrorTypes.includes((translationOrError as TranslationError)?.type);

const findErrors = (errors: TranslationError[], type: TranslationError['type']) =>
  errors.filter((error) => isTranslationError(error) && error.type === type);

const getConflictAlertMessage = (errors: TranslationError[]) => {
  const conflictErrors = findErrors(errors, 'CONFLICT');
  if (conflictErrors.length > 0) {
    return conflictErrors.length === 1
      ? `1 oversettelse ble ikke lagret fordi en nyere versjon allerede eksisterer. Last siden på nytt for å endre oversettelsen.`
      : `${conflictErrors.length} oversettelser ble ikke lagret fordi en nyere versjon allerede eksisterer. Last siden på nytt for å endre oversettelsene.`;
  }
};

const getGeneralAlertMessage = (errors: TranslationError[]) => {
  const otherErrors = findErrors(errors, 'OTHER_HTTP');
  if (otherErrors.length > 0) {
    return otherErrors.length === 1
      ? `1 oversettelse ble ikke lagret på grunn av en teknisk feil. Last siden på nytt for å endre oversettelsen.`
      : `${otherErrors.length} oversettelser ble ikke lagret på grunn av en teknisk feil. Last siden på nytt for å endre oversettelsene.`;
  }
};

const getTranslationHttpError = (
  status: number,
  translation: FormsApiTranslation,
  isNew?: boolean,
): TranslationError => {
  switch (status) {
    case 409:
      return {
        type: 'CONFLICT',
        message: isNew
          ? 'Det eksisterer allerede en global oversettelse med denne bokmålsteksten'
          : 'Det oppsto en konflikt. Last siden på nytt for å endre',
        key: translation.key,
        isNewTranslation: isNew,
      };
    default:
      return {
        type: 'OTHER_HTTP',
        message: 'Det oppsto en ukjent feil. Prøv på nytt eller last siden på nytt',
        key: translation.key,
        isNewTranslation: isNew,
      };
  }
};

export { getConflictAlertMessage, getGeneralAlertMessage, getTranslationHttpError, isTranslationError };
export type { TranslationError };
