import DataFetcher from './DataFetcher';

const dataFetcherBuilder = () => {
  const schema = DataFetcher.schema();
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
