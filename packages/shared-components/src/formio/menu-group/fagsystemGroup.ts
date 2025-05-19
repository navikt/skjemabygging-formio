import dataFetcherBuilder from '../components/core/data-fetcher/DataFetcher.builder';

const fagsystemGroup = {
  title: 'Fagsystem (Beta)',
  components: {
    activities: dataFetcherBuilder('Aktivitetsvelger', 'activities'),
  },
};

export default fagsystemGroup;
