import { dateUtils, FyllutState, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { SendInnSoknadResponse } from '../../../api/sendinn/sendInnSoknad';

export const getFyllutMellomlagringState = (
  response?: SendInnSoknadResponse,
): FyllutState['mellomlagring'] | undefined => {
  if (response) {
    const submission = response?.hoveddokumentVariant?.document?.data;
    return {
      ...submission?.fyllutState?.mellomlagring,
      isActive: true,
      savedDate: dateUtils.toLocaleDateAndTime(response.endretDato),
      deletionDate: dateUtils.toLocaleDate(response.skalSlettesDato),
    };
  }
};

export const getSubmissionWithFyllutState = (response?: SendInnSoknadResponse) => {
  if (response) {
    const submission = response?.hoveddokumentVariant?.document?.data;
    return {
      ...submission,
      fyllutState: {
        ...submission?.fyllutState,
        mellomlagring: getFyllutMellomlagringState(response) ?? submission?.fyllutState?.mellomlagring,
      },
    };
  }
};

export const removeFyllutState = (submission: Submission): Submission => {
  const submissionCopy = { ...submission };
  delete submissionCopy.fyllutState;
  return submissionCopy;
};
