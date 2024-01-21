import {
  Component,
  dateUtils,
  FyllutState,
  NavFormType,
  navFormUtils,
  Submission,
  SubmissionData,
} from '@navikt/skjemadigitalisering-shared-domain';
import { SendInnSoknadResponse } from '../../../api/sendinn/sendInnSoknad';

const findComponent = (components: Component[], key: string) => components.find((component) => component.key === key);

const filterOutIfNoCorrespondingComponent = (originalData: SubmissionData, components: Component[]) => {
  const filteredSubmissionEntries = Object.entries(originalData)
    .map(([key, value]) => {
      const component = findComponent(components, key);
      if (!component) return undefined;
      if (typeof value === 'object' && component.components) {
        const nestedData = filterOutIfNoCorrespondingComponent(value as SubmissionData, component.components);
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
  const submissionFromResponse = response?.hoveddokumentVariant?.document?.data;
  if (!submissionFromResponse) {
    return { data: {} };
  }

  if (!form) {
    return submissionFromResponse;
  }

  const components = navFormUtils.flattenComponents(form.components);
  const submissionData = filterOutIfNoCorrespondingComponent(submissionFromResponse.data, components);

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
