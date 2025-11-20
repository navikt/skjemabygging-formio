import { PdfComponentProps } from '../../../types';
import { getSelectedValues } from './dataFetcherUtils';

const PdfDataFetcher = (props: PdfComponentProps) => {
  const { component, submissionPath, submission, translate } = props;
  const { label } = component;

  const selected = getSelectedValues(submissionPath, submission);
  if (selected.length === 0) {
    return null;
  }

  return {
    label: translate(label),
    verdiliste: selected.map((value) => {
      return { label: value };
    }),
  };
};

export default PdfDataFetcher;
