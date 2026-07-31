import { Box, Button, HStack } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useFyllutAppConfig } from '../context/fyllut/FyllutAppConfigContext';
import { useFyllutLanguage } from '../context/fyllut/FyllutLanguageContext';
import { deleteSoknad } from './api/sendInnSoknad';
import { useAttachmentUpload } from './attachment-upload/AttachmentUploadContext';
import { FormPrevButton, useFormPersistence, useSubmissionState } from './framework';
import ConfirmationModal from './fyllut-components/ConfirmationModal';
import { getExitUrl } from './fyllut-utils/url';

interface Props {
  introUploadIdLink?: boolean;
  exitOnly?: boolean;
}

const DELETED_DRAFT_STORAGE_KEY = 'fyllut:new-render:deleted-draft-id';
const DELETED_DRAFT_QUERY_PARAM = 'deletedDraft';

const FormSecondaryButtons = ({ introUploadIdLink = false, exitOnly = false }: Props) => {
  const appConfig = useFyllutAppConfig();
  const { submissionMethod } = appConfig;
  const { translate } = useFyllutLanguage();
  const navigate = useNavigate();
  const { search } = useLocation();
  const { submission, setSubmission } = useSubmissionState();
  const { saveDraft, canSaveDraft } = useFormPersistence();
  const { handleDeleteAllFiles } = useAttachmentUpload();
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const deletionDate = submission?.fyllutState?.mellomlagring?.deletionDate ?? '';
  const exitUrl = getExitUrl(window.location.href);
  const innsendingsId = new URLSearchParams(search).get('innsendingsId');

  const handleSaveDraft = async () => {
    if (!submission) {
      throw new Error('Kunne ikke lagre. Innsendingen er tom.');
    }

    await saveDraft();
    setSaveModalOpen(false);
  };

  const handleCancel = async () => {
    if (submissionMethod === 'digital' && innsendingsId) {
      await deleteSoknad(appConfig, innsendingsId);
      sessionStorage.setItem(DELETED_DRAFT_STORAGE_KEY, innsendingsId);
      const deletedDraftUrl = new URL(window.location.href);
      deletedDraftUrl.searchParams.set(DELETED_DRAFT_QUERY_PARAM, '1');
      window.history.replaceState(window.history.state, '', deletedDraftUrl.toString());
    } else if (submissionMethod === 'digitalnologin') {
      await handleDeleteAllFiles();
    }

    setSubmission(undefined);
    setCancelModalOpen(false);
  };

  return (
    <>
      <Box marginBlock="space-16 space-0">
        <HStack gap="space-16" wrap>
          {introUploadIdLink && submissionMethod === 'digitalnologin' && (
            <FormPrevButton
              label={translate(TEXTS.grensesnitt.navigation.uploadID)}
              onClick={() => navigate({ pathname: 'legitimasjon', search })}
            />
          )}
          {!exitOnly && canSaveDraft && (
            <Button variant="tertiary" onClick={() => setSaveModalOpen(true)}>
              {translate(TEXTS.grensesnitt.navigation.saveDraft)}
            </Button>
          )}
          <Button variant="tertiary" onClick={() => setCancelModalOpen(true)}>
            {translate(exitOnly ? TEXTS.grensesnitt.navigation.exit : TEXTS.grensesnitt.navigation.cancelAndDelete)}
          </Button>
        </HStack>
      </Box>
      {!exitOnly && canSaveDraft && (
        <ConfirmationModal
          open={saveModalOpen}
          onClose={() => setSaveModalOpen(false)}
          onConfirm={handleSaveDraft}
          confirmType="primary"
          texts={{
            ...TEXTS.grensesnitt.confirmSavePrompt,
            body: translate(TEXTS.grensesnitt.confirmSavePrompt.body, { date: deletionDate }),
          }}
          exitUrl={exitUrl}
        />
      )}
      <ConfirmationModal
        open={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={exitOnly ? undefined : handleCancel}
        confirmType="danger"
        texts={
          exitOnly
            ? TEXTS.grensesnitt.confirmCancelPrompt
            : submissionMethod === 'digital'
              ? TEXTS.grensesnitt.confirmDeletePrompt
              : TEXTS.grensesnitt.confirmDiscardPrompt
        }
        exitUrl={exitUrl}
      />
    </>
  );
};

export default FormSecondaryButtons;
