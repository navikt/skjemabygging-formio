import { ArrowRightIcon } from '@navikt/aksel-icons';
import { BodyShort, Button } from '@navikt/ds-react';
import { Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useLanguages } from '../../context/languages';
import DigitalSubmissionButton from '../button/navigation/digital-submission/DigitalSubmissionButton';
import Modal from '../modal/Modal';

export interface Props {
  submission?: Submission;
  isValid?: (e: React.MouseEvent<HTMLElement>) => boolean;
  onError: (err: Error) => void;
}

// TODO flytt ut modal til DigitalSubmissionButton slik som SaveButton og CancelButton gjør det
const DigitalSubmissionWithPrompt = ({ submission, isValid, onError }: Props) => {
  const { translate } = useLanguages();
  const [isOpen, setIsOpen] = useState(false);

  const handleClick = (e) => {
    if (isValid && !isValid(e)) {
      return;
    }
    setIsOpen(true);
  };

  return (
    <>
      <Button onClick={handleClick} icon={<ArrowRightIcon />} iconPosition={'right'}>
        {translate(TEXTS.grensesnitt.submitToNavPrompt.open)}
      </Button>
      <Modal
        open={isOpen}
        title={translate(TEXTS.grensesnitt.submitToNavPrompt.title)}
        onClose={() => setIsOpen(false)}
      >
        <Modal.Body>
          <BodyShort>{translate(TEXTS.grensesnitt.submitToNavPrompt.body)}</BodyShort>
        </Modal.Body>

        <Modal.Footer>
          <DigitalSubmissionButton
            submission={submission}
            onError={(err) => {
              onError(err);
              setIsOpen(false);
            }}
            onDone={() => setIsOpen(false)}
          >
            {translate(TEXTS.grensesnitt.submitToNavPrompt.confirm)}
          </DigitalSubmissionButton>
          <Button
            variant="tertiary"
            onClick={() => {
              setIsOpen(false);
            }}
          >
            {translate(TEXTS.grensesnitt.submitToNavPrompt.cancel)}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default DigitalSubmissionWithPrompt;
