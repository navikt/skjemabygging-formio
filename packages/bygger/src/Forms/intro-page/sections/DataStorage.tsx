import { Accordion } from '@navikt/ds-react';
import { Intro } from '@navikt/skjemadigitalisering-shared-components';
import { SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import useKeyBasedText from '../../../hooks/useKeyBasedText';
import { SectionWrapper } from './SectionWrapper';
import { usePreviewStyles } from './styles';

interface Props {
  submissionMethod: SubmissionMethod;
}

export function DataStorage({ submissionMethod }: Props) {
  const { getKeyBasedText } = useKeyBasedText();
  const previewStyles = usePreviewStyles();

  if (submissionMethod === 'paper') {
    return null;
  }

  return (
    <SectionWrapper
      right={
        <Accordion className={previewStyles.accordion}>
          <Intro.DataStorage translate={getKeyBasedText} defaultOpen />
        </Accordion>
      }
    />
  );
}
