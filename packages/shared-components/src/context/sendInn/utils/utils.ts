import {
  FyllutState,
  NavFormType,
  Submission,
  dateUtils,
  formSummaryUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { SendInnSoknadResponse } from '../../../api/sendinn/sendInnSoknad';

const getSubmissionFromResponse = (response?: SendInnSoknadResponse, form?: NavFormType): Submission => {
  const submissionFromResponse: Submission | undefined = response?.hoveddokumentVariant?.document?.data;
  if (!submissionFromResponse) {
    return { data: {} };
  }

  if (!form) {
    return submissionFromResponse;
  }

  return formSummaryUtils.filterSubmissionDataToSummary(form, submissionFromResponse);
};

export const getFyllutMellomlagringState = (
  response?: SendInnSoknadResponse,
): FyllutState['mellomlagring'] | undefined => {
  if (response) {
    const submission = getSubmissionFromResponse(response);
    return {
      ...submission?.fyllutState?.mellomlagring,
      isActive: true,
      savedDate: dateUtils.toLocaleDateAndTime(response.endretDato),
      deletionDate: dateUtils.toLocaleDate(response.skalSlettesDato),
    };
  }
};

export const getSubmissionWithFyllutState = (
  response?: SendInnSoknadResponse,
  form?: NavFormType,
): Submission | undefined => {
  if (response) {
    const submission = getSubmissionFromResponse(response, form);
    return {
      ...submission,
      fyllutState: {
        ...submission?.fyllutState,
        mellomlagring: getFyllutMellomlagringState(response) ?? submission?.fyllutState?.mellomlagring,
      },
    };
  }
};

export const transformSubmissionBeforeSubmitting = (submission: Submission): Submission => {
  if (!submission?.data || (typeof submission.data === 'object' && Object.keys(submission.data).length === 0)) {
    return { data: {} };
  }

  const replacer = (_key: string, value: string | number | boolean | any[] | object) => {
    //Remove empty objects and empty arrays (but not null)
    if (value && typeof value === 'object' && Object.keys(value).length === 0) {
      return undefined;
    }
    return value;
  };

  const { data, fyllutState, ...rest } = submission;
  const dataCopy = JSON.parse(JSON.stringify(data, replacer)) ?? {};

  return { data: dataCopy, ...rest };
};
