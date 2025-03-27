import dataFetcherBuilder from '../components/core/data-fetcher/DataFetcher.builder';

const fagsystemGroup = {
  title: 'Fagsystem',
  components: {
    activities: dataFetcherBuilder(),
  },
};

export default fagsystemGroup;
