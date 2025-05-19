import { DataFetcherSourceId } from '@navikt/skjemadigitalisering-shared-domain';
import DataFetcher from './DataFetcher';

const dataFetcherBuilder = (label: string, dataFetcherSourceId: DataFetcherSourceId) => {
  const schema = DataFetcher.schema(dataFetcherSourceId, label);
  return {
    title: schema.label,
    schema: {
      ...schema,
      validate: {
        required: true,
      },
    },
  };
};

export default dataFetcherBuilder;
