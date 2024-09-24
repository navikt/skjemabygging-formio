import { PadlockLockedIcon } from '@navikt/aksel-icons';
import { Button, VStack } from '@navikt/ds-react';

import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { FormPropertiesType, I18nTranslations, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import ButtonWithSpinner from '../../components/ButtonWithSpinner';
import SidebarLayout from '../../components/layout/SidebarLayout';
import UserFeedback from '../../components/UserFeedback';
import useLockedFormModal from '../../hooks/useLockedFormModal';
import LockedFormModal from '../lockedFormModal/LockedFormModal';
import FormStatusPanel from '../status/FormStatusPanel';
import ToggleFormLockButton from '../toggleFormLockButton/ToggleFormLockButton';
import UnpublishButton from '../unpublish/UnpublishButton';

interface FormSettingsPageProps {
  form: NavFormType;
  onPublish: (form: NavFormType, translations: I18nTranslations) => void;
  onUnpublish: () => void;
  onChangeLockedState: (properties: Partial<FormPropertiesType>) => Promise<void>;
  onCopyFromProd: () => void;
  validateAndSave: (form: NavFormType) => void;
  setOpenPublishSettingModal: (open: boolean) => void;
}

const FormSettingsSidebar = ({
  form,
  onUnpublish,
  onChangeLockedState,
  onCopyFromProd,
  validateAndSave,
  setOpenPublishSettingModal,
}: FormSettingsPageProps) => {
  const isLockedForm = form.properties.isLockedForm;
  const { config } = useAppConfig();
  const { openLockedFormModal, isLockedFormModalOpen, closeLockedFormModal } = useLockedFormModal();

  const doIfUnlocked = (whenUnlocked: () => void): void => {
    if (isLockedForm) {
      openLockedFormModal();
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
          onClick={() => doIfUnlocked(() => setOpenPublishSettingModal(true))}
          type="button"
          size="small"
          icon={isLockedForm && <PadlockLockedIcon title="Skjemaet er låst" />}
        >
          Publiser
        </Button>
        <UnpublishButton onUnpublish={onUnpublish} form={form} />
        {!config?.isProdGcp && (
          <ButtonWithSpinner variant="tertiary" onClick={onCopyFromProd} size="small">
            Kopier fra produksjon
          </ButtonWithSpinner>
        )}
        <ToggleFormLockButton onChangeLockedState={onChangeLockedState} isLockedForm={isLockedForm} />
        <UserFeedback />
        <FormStatusPanel publishProperties={form.properties} />
      </VStack>
      <LockedFormModal open={isLockedFormModalOpen} onClose={closeLockedFormModal} form={form} />
    </SidebarLayout>
  );
};

export default FormSettingsSidebar;
