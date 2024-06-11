import {
  FyllutState,
  NavFormType,
  Submission,
  SubmissionData,
  dateUtils,
  formSummaryUtil,
} from '@navikt/skjemadigitalisering-shared-domain';
import { SendInnSoknadResponse } from '../../../api/sendinn/sendInnSoknad';

const findComponent = (formSummaryComponents, key: string) => {
  let result: any[] = [];
  formSummaryComponents.forEach((summaryComponent) => {
    if (summaryComponent.type === 'navSkjemagruppe') {
      result = [...result, ...findComponent(summaryComponent.components, key)];
    } else if (summaryComponent.key.split('.')[0] === key) {
      result = [...result, summaryComponent];
    }
  });
  return result;
};

const isChainedKey = (key: string) => key.split('.').length > 1;

const removeFirstConainerPrefixFromKey = (component) => {
  const [_containerKey, ...newKey] = component.key.split('.');
  return { ...component, key: newKey.join('.') };
};

const filterOutIfNotInSummary = (originalData: SubmissionData, formSummaryComponents) => {
  const filteredSubmissionEntries = Object.entries(originalData).reduce<[string, SubmissionData['Prop']][]>(
    (previousEntries, [key, value]): [string, SubmissionData['Prop']][] => {
      const matchingComponents = findComponent(formSummaryComponents, key);
      // Remove value from submission
      if (matchingComponents.length === 0) return previousEntries;
      // Container
      if (isChainedKey(matchingComponents[0].key)) {
        const containerComponents = matchingComponents.map(removeFirstConainerPrefixFromKey);
        const nestedData = filterOutIfNotInSummary(value as SubmissionData, containerComponents);
        return nestedData ? [...previousEntries, [key, nestedData]] : previousEntries;
      }
      const [matchingComponent] = matchingComponents;
      // Datagrid
      if (matchingComponent.type === 'datagrid') {
        const nestedData = (matchingComponent.components as any[]).map((row, index) => {
          return filterOutIfNotInSummary(value[index], row.components);
        });
        return [...previousEntries, [key, nestedData]];
      }

      return [...previousEntries, [key, value]];
    },
    [],
  );

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

  const formSummaryComponents = formSummaryUtil
    .createFormSummaryPanels(form, submissionFromResponse)
    .flatMap((panel) => panel.components);
  const submissionData = filterOutIfNotInSummary({ ...submissionFromResponse.data }, formSummaryComponents);
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
