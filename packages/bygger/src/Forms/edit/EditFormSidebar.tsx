import { PadlockLockedIcon } from '@navikt/aksel-icons';
import { Button, VStack } from '@navikt/ds-react';
import { useModal } from '@navikt/skjemadigitalisering-shared-components';
import { I18nTranslations, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import ButtonWithSpinner from '../../components/ButtonWithSpinner';
import SidebarLayout from '../../components/layout/SidebarLayout';
import UserFeedback from '../../components/UserFeedback';
import LockedFormModal from '../lockedFormModal/LockedFormModal';
import PublishModalComponents from '../publish/PublishModalComponents';
import FormStatusPanel from '../status/FormStatusPanel';
import UnpublishButton from '../unpublish/UnpublishButton';

interface EditFormSidebarProps {
  form: NavFormType;
  onSave: (form: NavFormType) => Promise<void>;
  onPublish: (form: NavFormType, translations: I18nTranslations) => void;
  onUnpublish: () => void;
}

const EditFormSidebar = ({ form, onSave, onPublish, onUnpublish }: EditFormSidebarProps) => {
  const [openPublishSettingModal, setOpenPublishSettingModal] = useModal();
  const [lockedFormModal, setLockedFormModal] = useModal();

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
              await onSave(form);
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
        <UnpublishButton onUnpublish={onUnpublish} form={form} />
        <UserFeedback />
        <FormStatusPanel publishProperties={form.properties} />

        <PublishModalComponents
          form={form}
          onPublish={onPublish}
          openPublishSettingModal={openPublishSettingModal}
          setOpenPublishSettingModal={setOpenPublishSettingModal}
        />

        <LockedFormModal open={lockedFormModal} onClose={() => setLockedFormModal(false)} form={form} />
      </VStack>
    </SidebarLayout>
  );
};

export default EditFormSidebar;
