import { ArrowRightIcon } from '@navikt/aksel-icons';
import { Button, ButtonProps } from '@navikt/ds-react';
import { Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useAppConfig } from '../../configContext';
import { useAmplitude } from '../../context/amplitude';
import { useLanguages } from '../../context/languages';
import { useSendInn } from '../../context/sendInn/sendInnContext';

export interface Props {
  submission?: Submission;
  isValid?: (e: React.MouseEvent<HTMLElement>) => boolean;
  onError: Function;
  children: string;
  withIcon?: boolean;
}

const DigitalSubmissionButton = ({ submission, isValid, onError, children, withIcon = false }: Props) => {
  const { loggNavigering } = useAmplitude();
  const { app } = useAppConfig();
  const { translate } = useLanguages();
  const { submitSoknad } = useSendInn();
  const [loading, setLoading] = useState(false);
  const sendInn = async (e) => {
    if (isValid && !isValid(e)) {
      return;
    }

    if (app === 'bygger') {
      onError(new Error('Digital innsending er ikke støttet ved forhåndsvisning i byggeren.'));
      return;
    }

    if (!submission) {
      onError(new Error(translate(TEXTS.grensesnitt.emptySubmissionError)));
      return;
    }

    try {
      setLoading(true);
      loggNavigering({ lenkeTekst: children, destinasjon: '/sendinn' });
      await submitSoknad(submission);
    } catch (err: any) {
      onError(err);
    } finally {
      setLoading(false);
    }
  };

  const iconProps: Partial<ButtonProps> = withIcon
    ? {
        icon: <ArrowRightIcon aria-hidden />,
        iconPosition: 'right',
      }
    : {};

  return (
    <Button onClick={sendInn} loading={loading} {...iconProps}>
      {children}
    </Button>
  );
};

export default DigitalSubmissionButton;
