import { BodyShort, Button, InlineMessage, Modal } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';

const AttachmentCancelModal = ({
  open,
  onClose,
  onCancel,
  exitUrl,
}: {
  open: boolean;
  onClose: () => void;
  onCancel?: () => Promise<void>;
  exitUrl?: string;
}) => {
  const { translate } = useLanguage();
  const { setSubmission } = useSubmissionState();
  const [cancelError, setCancelError] = useState<string>();

  const close = () => {
    setCancelError(undefined);
    onClose();
  };

  return (
    <Modal open={open} onClose={close} header={{ heading: translate(TEXTS.grensesnitt.confirmDiscardPrompt.title) }}>
      <Modal.Body>
        <BodyShort>{translate(TEXTS.grensesnitt.confirmDiscardPrompt.body)}</BodyShort>
        {cancelError && <InlineMessage status="error">{cancelError}</InlineMessage>}
      </Modal.Body>
      <Modal.Footer>
        <Button
          onClick={() =>
            void (async () => {
              try {
                setCancelError(undefined);
                await onCancel?.();
                setSubmission(undefined);
                close();
                if (exitUrl) {
                  window.location.assign(exitUrl);
                }
              } catch {
                setCancelError(translate(TEXTS.statiske.uploadFile.deleteAllFilesError));
              }
            })()
          }
        >
          {translate(TEXTS.grensesnitt.confirmDiscardPrompt.confirm)}
        </Button>
        <Button variant="secondary" onClick={close}>
          {translate(TEXTS.grensesnitt.confirmDiscardPrompt.cancel)}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AttachmentCancelModal;
