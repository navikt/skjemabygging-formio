import {
  FyllutState,
  NavFormType,
  Submission,
  SubmissionData,
  dateUtils,
  formSummaryUtil,
  navFormUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { SendInnSoknadResponse } from '../../../api/sendinn/sendInnSoknad';

const findComponentKeys = (formSummaryKeys: string[][], key): string[][] => {
  return formSummaryKeys.filter((componentKeys) => componentKeys[0] === key);
};

const filterOutIfNotInSummary = (originalData: SubmissionData, formSummaryKeys: string[][]) => {
  const filteredSubmissionEntries = Object.entries(originalData)
    .map(([key, value]) => {
      const componentKeys = findComponentKeys(formSummaryKeys, key);
      if (componentKeys.length === 0) return undefined;
      if (typeof value === 'object' && componentKeys[0].length > 1) {
        const nestedData = filterOutIfNotInSummary(
          value as SubmissionData,
          componentKeys.map(([_first, ...rest]) => rest),
        );
        if (nestedData) {
          return [key, nestedData];
        }
        return undefined;
      }
      return [key, value];
    })
    .filter((entry) => !!entry);

  return Object.fromEntries(filteredSubmissionEntries);
};

const getSubmissionFromResponse = (response?: SendInnSoknadResponse, form?: NavFormType): Submission => {
  const submissionFromResponse: Submission | undefined = response?.hoveddokumentVariant?.document?.data;
  if (!submissionFromResponse) {
    return { data: {} };
  }

  if (!form) {
    return submissionFromResponse;
  }

  const formSummaryKeys: string[][] = formSummaryUtil
    .createFormSummaryPanels(form, submissionFromResponse)
    .flatMap((panel) => navFormUtils.flattenComponents(panel.components))
    .map((component) => component.key.split('.'));
  const submissionData = filterOutIfNotInSummary({ ...submissionFromResponse.data }, formSummaryKeys);

  return { ...submissionFromResponse, data: submissionData };
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

export const removeFyllutState = (submission: Submission): Submission => {
  const submissionCopy = { ...submission };
  delete submissionCopy.fyllutState;
  return submissionCopy;
};
