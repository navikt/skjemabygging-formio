import { PadlockLockedIcon } from '@navikt/aksel-icons';
import { Button, ErrorMessage, VStack } from '@navikt/ds-react';
import { ButtonWithSpinner, useModal } from '@navikt/skjemadigitalisering-shared-components';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import SidebarLayout from '../../../components/layout/SidebarLayout';
import UserFeedback from '../../../components/UserFeedback';
import LockedFormModal from '../../lockedFormModal/LockedFormModal';
import FormStatusPanel from '../../status/FormStatusPanel';
import UnpublishButton from '../../unpublish/UnpublishButton';

interface FormSettingsPageProps {
  form: Form;
  validateAndSave: (form: Form) => Promise<void>;
  setOpenPublishSettingModal: (open: boolean) => void;
  validateAndOpenPublishSettingModal: () => void;
  validationErrorMessage?: string;
}

export function FormIntroPageSidebar({
  form,
  validateAndSave,
  validateAndOpenPublishSettingModal,
  validationErrorMessage,
}: FormSettingsPageProps) {
  const [lockedFormModal, setLockedFormModal] = useModal();
  const isLockedForm = !!form.lock;

  const doIfUnlocked = (whenUnlocked: () => void): void => {
    if (isLockedForm) {
      setLockedFormModal(true);
    } else {
      whenUnlocked();
    }
  };

  return (
    <SidebarLayout noScroll={true}>
      <VStack gap="1">
        <ButtonWithSpinner
          onClick={() => doIfUnlocked(() => validateAndSave(form))}
          size="small"
          icon={isLockedForm && <PadlockLockedIcon title="Skjemaet er låst" />}
        >
          Lagre
        </ButtonWithSpinner>
        <Button
          variant="secondary"
          onClick={() => doIfUnlocked(() => validateAndOpenPublishSettingModal())}
          type="button"
          size="small"
          icon={isLockedForm && <PadlockLockedIcon title="Skjemaet er låst" />}
        >
          Publiser
        </Button>
        <UnpublishButton form={form} />
        {validationErrorMessage && (
          <ErrorMessage showIcon size="medium">
            {validationErrorMessage}
          </ErrorMessage>
        )}
        <UserFeedback />
        <FormStatusPanel formStatusProperties={form} />
      </VStack>
      <LockedFormModal open={lockedFormModal} onClose={() => setLockedFormModal(false)} form={form} />
    </SidebarLayout>
  );
}
