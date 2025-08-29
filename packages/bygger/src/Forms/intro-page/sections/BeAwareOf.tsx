import { Accordion } from '@navikt/ds-react';
import { Intro } from '@navikt/skjemadigitalisering-shared-components';
import { SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import useKeyBasedText from '../../../hooks/useKeyBasedText';
import { SectionWrapper } from './SectionWrapper';
import { usePreviewStyles } from './styles';

interface Props {
  submissionMethod: SubmissionMethod;
}

export function BeAwareOf({ submissionMethod }: Props) {
  const { getKeyBasedText } = useKeyBasedText();
  const previewStyles = usePreviewStyles();

  return (
    <SectionWrapper
      right={
        <Accordion className={previewStyles.accordion}>
          <Intro.BeAwareOf translate={getKeyBasedText} submissionMethod={submissionMethod} />
        </Accordion>
      }
    />
  );
}
