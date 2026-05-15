import { getSelectedValues } from '@navikt/skjemadigitalisering-shared-domain';
import { PdfComponentProps } from '../../../types';

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
    visningsVariant: 'PUNKTLISTE',
  };
};

export default PdfDataFetcher;
