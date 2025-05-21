import { Component, dataFetcherSources } from '@navikt/skjemadigitalisering-shared-domain';

const dataFetcherSource = (): Component => {
  return {
    label: 'Datakilde',
    key: 'dataFetcherSourceId',
    input: true,
    type: 'select',
    disabled: true,
    validate: {
      required: true,
    },
    data: {
      values: Object.keys(dataFetcherSources).map((id) => ({ value: id, label: dataFetcherSources[id].description })),
    },
  };
};

export default dataFetcherSource;
