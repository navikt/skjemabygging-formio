import { PadlockLockedIcon } from '@navikt/aksel-icons';
import { Button, VStack } from '@navikt/ds-react';

import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { I18nTranslations, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import ButtonWithSpinner from '../../components/ButtonWithSpinner';
import SidebarLayout from '../../components/layout/SidebarLayout';
import UserFeedback from '../../components/UserFeedback';
import useLockedFormModal from '../../hooks/useLockedFormModal';
import FormStatusPanel from '../status/FormStatusPanel';
import UnpublishButton from '../unpublish/UnpublishButton';

interface FormSettingsPageProps {
  form: NavFormType;
  onPublish: (form: NavFormType, translations: I18nTranslations) => void;
  onUnpublish: () => void;
  onCopyFromProd: () => void;
  validateAndSave: (form: NavFormType) => void;
  setOpenPublishSettingModal: (open: boolean) => void;
}

const FormSettingsSidebar = ({
  form,
  onUnpublish,
  onCopyFromProd,
  validateAndSave,
  setOpenPublishSettingModal,
}: FormSettingsPageProps) => {
  const isLockedForm = form.properties.isLockedForm;
  const { config } = useAppConfig();
  const { openLockedFormModal } = useLockedFormModal(form);

  return (
    <SidebarLayout noScroll={true}>
      <VStack gap="1">
        <ButtonWithSpinner onClick={() => validateAndSave(form)} size="small">
          Lagre
        </ButtonWithSpinner>
        <Button
          variant="secondary"
          onClick={() => {
            if (isLockedForm) {
              openLockedFormModal();
            } else {
              setOpenPublishSettingModal(true);
            }
          }}
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
        <UserFeedback />
        <FormStatusPanel publishProperties={form.properties} />
      </VStack>
    </SidebarLayout>
  );
};

export default FormSettingsSidebar;
