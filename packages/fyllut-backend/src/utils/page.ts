import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { config } from '../config/config';
import { NaisCluster } from '../config/nais-cluster';
import { QueryParamSub } from '../types/custom';

const defaultMeta = {
  ROBOTS: 'noindex',
  PAGE_TITLE: 'Fyll ut skjema - www.nav.no',
  PAGE_DESCRIPTION: 'NAV søknadsskjema',
};

export const getDefaultPageMeta = () => ({ ...defaultMeta });

export const getQueryParamSub = (form: NavFormType): QueryParamSub => {
  if (form.properties.innsending === 'KUN_PAPIR') {
    return 'paper';
  } else if (form.properties.innsending === 'KUN_DIGITAL') {
    return 'digital';
  }
  return undefined;
};

export const getFormMeta = (form: NavFormType) => {
  return {
    ROBOTS: config.naisClusterName === NaisCluster.PROD ? 'all' : defaultMeta.ROBOTS,
    PAGE_TITLE: form.title || defaultMeta.PAGE_TITLE,
    PAGE_DESCRIPTION: defaultMeta.PAGE_DESCRIPTION,
  };
};
