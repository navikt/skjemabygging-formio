import { BodyShort, Box, Button, HStack, Modal } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useAppConfig } from '../../context/app-config/AppConfigContext';
import { useLanguage } from '../../context/language/LanguageContext';
import { useFormPersistence } from '../../context/persistence/PersistenceContext';
import { useSubmissionState } from '../../context/state/SubmissionStateContext';
import { FormPrevButton } from '../../layout/FormButtonRow';
import type { SharedFormRendererProps } from '../types';

const SecondaryActions = ({
  host,
  exitOnly = false,
  showIdentification = false,
}: {
  host: SharedFormRendererProps['host'];
  exitOnly?: boolean;
  showIdentification?: boolean;
}) => {
  const { translate } = useLanguage();
  const { submissionMethod } = useAppConfig();
  const { submission, setSubmission } = useSubmissionState();
  const { saveDraft, canSaveDraft } = useFormPersistence();
  const [saveOpen, setSaveOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const adapter = host.secondaryActions;
  const deletionDate = submission?.fyllutState?.mellomlagring?.deletionDate ?? '';
  const prompt = exitOnly
    ? TEXTS.grensesnitt.confirmCancelPrompt
    : submissionMethod === 'digital'
      ? TEXTS.grensesnitt.confirmDeletePrompt
      : TEXTS.grensesnitt.confirmDiscardPrompt;

  if (!adapter) {
    return null;
  }

  const cancel = async () => {
    await adapter.cancel(submission);
    setSubmission(undefined);
    setCancelOpen(false);
  };

  return (
    <>
      <Box marginBlock="space-16 space-0">
        <HStack gap="space-16" wrap>
          {showIdentification && adapter.showIdentificationAction && (
            <FormPrevButton
              label={translate(TEXTS.grensesnitt.navigation.uploadID)}
              onClick={() => adapter.onIdentification?.()}
            />
          )}
          {!exitOnly && canSaveDraft && (
            <Button variant="tertiary" onClick={() => setSaveOpen(true)}>
              {translate(TEXTS.grensesnitt.navigation.saveDraft)}
            </Button>
          )}
          <Button variant="tertiary" onClick={() => setCancelOpen(true)}>
            {translate(exitOnly ? TEXTS.grensesnitt.navigation.exit : TEXTS.grensesnitt.navigation.cancelAndDelete)}
          </Button>
        </HStack>
      </Box>
      {!exitOnly && canSaveDraft && (
        <Modal
          open={saveOpen}
          onClose={() => setSaveOpen(false)}
          header={{ heading: translate(TEXTS.grensesnitt.confirmSavePrompt.title) }}
        >
          <Modal.Body>
            <BodyShort>{translate(TEXTS.grensesnitt.confirmSavePrompt.body, { date: deletionDate })}</BodyShort>
          </Modal.Body>
          <Modal.Footer>
            <Button
              onClick={() =>
                void (async () => {
                  await saveDraft();
                  setSaveOpen(false);
                  window.location.assign(adapter.exitUrl);
                })()
              }
            >
              {translate(TEXTS.grensesnitt.confirmSavePrompt.confirm)}
            </Button>
            <Button variant="secondary" onClick={() => setSaveOpen(false)}>
              {translate(TEXTS.grensesnitt.confirmSavePrompt.cancel)}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      <Modal open={cancelOpen} onClose={() => setCancelOpen(false)} header={{ heading: translate(prompt.title) }}>
        <Modal.Body>
          <BodyShort>{translate(prompt.body)}</BodyShort>
        </Modal.Body>
        <Modal.Footer>
          <Button
            data-color={exitOnly ? undefined : 'danger'}
            onClick={() => {
              if (exitOnly) {
                window.location.assign(adapter.exitUrl);
                return;
              }
              void cancel();
            }}
          >
            {translate(prompt.confirm)}
          </Button>
          <Button variant="secondary" onClick={() => setCancelOpen(false)}>
            {translate(prompt.cancel)}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default SecondaryActions;
