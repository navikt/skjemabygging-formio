import { Accordion } from '@navikt/ds-react';
import { Intro } from '@navikt/skjemadigitalisering-shared-components';
import { SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import useKeyBasedText from '../../../hooks/useKeyBasedText';
import { SectionWrapper } from './SectionWrapper';

interface Props {
  submissionMethod: SubmissionMethod;
}

export function DataStorage({ submissionMethod }: Props) {
  const { getKeyBasedText } = useKeyBasedText();

  return (
    <SectionWrapper
      right={
        <Accordion>
          <Intro.DataStorage translate={getKeyBasedText} submissionMethod={submissionMethod} />
        </Accordion>
      }
    />
  );
}
