import DataFetcher from './DataFetcher';

const dataFetcherBuilder = (label?: string) => {
  const schema = DataFetcher.schema(label);
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
