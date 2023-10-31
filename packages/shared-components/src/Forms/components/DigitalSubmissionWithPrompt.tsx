import { ArrowRightIcon } from '@navikt/aksel-icons';
import { BodyShort, Button } from '@navikt/ds-react';
import { Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import Modal from '../../components/modal/Modal';
import { useLanguages } from '../../context/languages';
import makeStyles from '../../util/jss';
import DigitalSubmissionButton from './DigitalSubmissionButton';

const useStyles = makeStyles({
  body: {
    paddingTop: '1.1rem',
    paddingBottom: '4rem',
    fontSize: '1.25rem',
  },
});

export interface Props {
  submission?: Submission;
  isValid?: (e: React.MouseEvent<HTMLElement>) => boolean;
  onError: (err: Error) => void;
}

const DigitalSubmissionWithPrompt = ({ submission, isValid, onError }: Props) => {
  const { translate } = useLanguages();
  const [isOpen, setIsOpen] = useState(false);

  const styles = useStyles();

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
        ariaLabel={translate(TEXTS.grensesnitt.submitToNavPrompt.ariaLabel)}
        onClose={() => setIsOpen(false)}
      >
        <BodyShort className={styles.body}>{translate(TEXTS.grensesnitt.submitToNavPrompt.body)}</BodyShort>
        <div className="button-row">
          <DigitalSubmissionButton
            submission={submission}
            onError={(err) => {
              onError(err.message);
              setIsOpen(false);
            }}
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
        </div>
      </Modal>
    </>
  );
};

export default DigitalSubmissionWithPrompt;
