import { dateUtils, FyllutState, Submission } from '@navikt/skjemadigitalisering-shared-domain';
import { SendInnSoknadResponse } from '../../api/sendInnSoknad';

export const getFyllutMellomlagringState = (
  response?: SendInnSoknadResponse,
): FyllutState['mellomlagring'] | undefined => {
  if (response?.hoveddokumentVariant?.document?.data) {
    const submission = response.hoveddokumentVariant.document.data;
    return {
      ...submission?.fyllutState?.mellomlagring,
      isActive: true,
      savedDate: dateUtils.toLocaleDateAndTime(response.endretDato),
    };
  }
};

export const getSubmissionWithFyllutState = (response?: SendInnSoknadResponse) => {
  if (response?.hoveddokumentVariant?.document?.data) {
    const submission = response.hoveddokumentVariant.document.data;
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
