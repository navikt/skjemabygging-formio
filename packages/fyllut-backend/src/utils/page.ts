import { NavFormType, submissionTypesUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { QueryParamSub } from '../types/custom';

const defaultMeta = {
  PAGE_TITLE: 'Fyll ut skjema - www.nav.no',
  PAGE_DESCRIPTION: 'Nav søknadsskjema',
};

export const getDefaultPageMeta = () => ({ ...defaultMeta });

export const getQueryParamSub = (form: NavFormType): QueryParamSub => {
  const { submissionTypes } = form.properties;
  if (submissionTypesUtils.isPaperSubmissionOnly(submissionTypes)) {
    return 'paper';
  } else if (submissionTypesUtils.isDigitalSubmissionOnly(submissionTypes)) {
    return 'digital';
  }
  return undefined;
};

export const getFormMeta = (form: NavFormType) => {
  return {
    PAGE_TITLE: form.title || defaultMeta.PAGE_TITLE,
    PAGE_DESCRIPTION: defaultMeta.PAGE_DESCRIPTION,
  };
};
