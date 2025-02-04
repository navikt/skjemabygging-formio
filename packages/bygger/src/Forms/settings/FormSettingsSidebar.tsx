import { PadlockLockedIcon } from '@navikt/aksel-icons';
import { Button, VStack } from '@navikt/ds-react';

import { useAppConfig, useModal } from '@navikt/skjemadigitalisering-shared-components';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import ButtonWithSpinner from '../../components/ButtonWithSpinner';
import SidebarLayout from '../../components/layout/SidebarLayout';
import UserFeedback from '../../components/UserFeedback';
import { useForm } from '../../context/old_form/FormContext';
import LockedFormModal from '../lockedFormModal/LockedFormModal';
import FormStatusPanel from '../status/FormStatusPanel';
import ToggleFormLockButton from '../toggleFormLockButton/ToggleFormLockButton';
import UnpublishButton from '../unpublish/UnpublishButton';

interface FormSettingsPageProps {
  form: Form;
  validateAndSave: (form: Form) => void;
  setOpenPublishSettingModal: (open: boolean) => void;
}

const FormSettingsSidebar = ({ form, validateAndSave, setOpenPublishSettingModal }: FormSettingsPageProps) => {
  const { config } = useAppConfig();
  const { copyFormFromProduction } = useForm();
  const [lockedFormModal, setLockedFormModal] = useModal();
  const { isLockedForm, lockedFormReason } = form.properties;

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
          onClick={() => doIfUnlocked(() => setOpenPublishSettingModal(true))}
          type="button"
          size="small"
          icon={isLockedForm && <PadlockLockedIcon title="Skjemaet er låst" />}
        >
          Publiser
        </Button>
        <UnpublishButton form={form} />
        {!config?.isProdGcp && (
          <ButtonWithSpinner variant="tertiary" onClick={copyFormFromProduction} size="small">
            Kopier fra produksjon
          </ButtonWithSpinner>
        )}
        <ToggleFormLockButton isLockedForm={isLockedForm} lockedFormReason={lockedFormReason} />
        <UserFeedback />
        <FormStatusPanel form={form} />
      </VStack>
      <LockedFormModal open={lockedFormModal} onClose={() => setLockedFormModal(false)} form={form} />
    </SidebarLayout>
  );
};

export default FormSettingsSidebar;
