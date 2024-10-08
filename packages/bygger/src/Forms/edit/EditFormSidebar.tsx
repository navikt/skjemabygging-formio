import { PadlockLockedIcon } from '@navikt/aksel-icons';
import { Button, VStack } from '@navikt/ds-react';
import { useModal } from '@navikt/skjemadigitalisering-shared-components';
import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import ButtonWithSpinner from '../../components/ButtonWithSpinner';
import SidebarLayout from '../../components/layout/SidebarLayout';
import UserFeedback from '../../components/UserFeedback';
import { useForm } from '../../context/form/FormContext';
import LockedFormModal from '../lockedFormModal/LockedFormModal';
import PublishModalComponents from '../publish/PublishModalComponents';
import FormStatusPanel from '../status/FormStatusPanel';
import UnpublishButton from '../unpublish/UnpublishButton';

interface EditFormSidebarProps {
  form: NavFormType;
}

const EditFormSidebar = ({ form }: EditFormSidebarProps) => {
  const [openPublishSettingModal, setOpenPublishSettingModal] = useModal();
  const [lockedFormModal, setLockedFormModal] = useModal();
  const { saveForm } = useForm();

  const {
    properties: { isLockedForm },
  } = form;

  return (
    <SidebarLayout noScroll={true}>
      <VStack gap="1">
        <ButtonWithSpinner
          onClick={async () => {
            if (isLockedForm) {
              setLockedFormModal(true);
            } else {
              await saveForm(form);
            }
          }}
          size="small"
          icon={isLockedForm && <PadlockLockedIcon title="Skjemaet er låst" />}
        >
          Lagre
        </ButtonWithSpinner>
        <Button
          variant="secondary"
          onClick={() => {
            if (isLockedForm) {
              setLockedFormModal(true);
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
        <UnpublishButton form={form} />
        <UserFeedback />
        <FormStatusPanel publishProperties={form.properties} />

        <PublishModalComponents
          form={form}
          openPublishSettingModal={openPublishSettingModal}
          setOpenPublishSettingModal={setOpenPublishSettingModal}
        />

        <LockedFormModal open={lockedFormModal} onClose={() => setLockedFormModal(false)} form={form} />
      </VStack>
    </SidebarLayout>
  );
};

export default EditFormSidebar;
