import { PdfComponentProps } from '../../../types';
import { getSelectedValues } from './dataFetcherUtils';

const PdfDataFetcher = ({ component, submissionPath, formContext, languagesContext }: PdfComponentProps) => {
  const { label } = component;
  const { submission } = formContext;
  const { translate } = languagesContext;

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
