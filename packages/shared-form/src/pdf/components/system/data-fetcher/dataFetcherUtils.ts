import { dataFetcherUtils } from '@navikt/skjemadigitalisering-shared-domain';

const getSelectedValues = (submissionPath, submission) => {
  if (!submission) {
    return [];
  }

  const fetcher = dataFetcherUtils.dataFetcher(submissionPath, submission);
  if (!fetcher?.success) {
    return [];
  }

  const selected = fetcher.getAllSelected().map((item) => item.label);
  if (selected.length === 0) {
    return [];
  }

  return selected;
};

export { getSelectedValues };
