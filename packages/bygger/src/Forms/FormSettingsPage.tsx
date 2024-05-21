import { PadlockLockedIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, Heading } from '@navikt/ds-react';

import { makeStyles, useAppConfig, useModal } from '@navikt/skjemadigitalisering-shared-components';
import { I18nTranslations, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import ButtonWithSpinner from '../components/ButtonWithSpinner';
import { FormMetadataEditor } from '../components/FormMetaDataEditor/FormMetadataEditor';
import { isFormMetadataValid, validateFormMetadata } from '../components/FormMetaDataEditor/utils/utils';
import UserFeedback from '../components/UserFeedback';
import Column from '../components/layout/Column';
import Row from '../components/layout/Row';
import useLockedFormModal from '../hooks/useLockedFormModal';
import PublishModalComponents from './publish/PublishModalComponents';
import FormStatusPanel from './status/FormStatusPanel';
import UnpublishButton from './unpublish/UnpublishButton';

const useStyles = makeStyles({
  mainCol: {
    gridColumn: '2 / 3',
  },
});

interface FormSettingsPageProps {
  form: NavFormType;
  publishedForm: NavFormType;
  onSave: (form: NavFormType) => void;
  onChange: (form: NavFormType) => void;
  onPublish: (form: NavFormType, translations: I18nTranslations) => void;
  onUnpublish: () => void;
  onCopyFromProd: () => void;
}

export function FormSettingsPage({
  form,
  publishedForm,
  onSave,
  onChange,
  onPublish,
  onUnpublish,
  onCopyFromProd,
}: FormSettingsPageProps) {
  const {
    title,
    properties: { skjemanummer },
  } = form;
  const isLockedForm = form.properties.isLockedForm;
  const [openPublishSettingModal, setOpenPublishSettingModal] = useModal();
  const { lockedFormModalContent, openLockedFormModal } = useLockedFormModal(form);

  const styles = useStyles();
  const [errors, setErrors] = useState({});
  const { config } = useAppConfig();

  const validateAndSave = async (form: NavFormType) => {
    const updatedErrors = validateFormMetadata(form, 'edit');
    if (isFormMetadataValid(updatedErrors)) {
      setErrors({});
      return await onSave(form);
    } else {
      setErrors(updatedErrors);
    }
  };

  return (
    <AppLayout
      navBarProps={{
        formMenu: true,
        formPath: form.path,
      }}
    >
      <Row className={styles.titleRow}>
        <Column className={styles.mainCol}>
          <Heading level="1" size="xlarge">
            {title}
          </Heading>
          <BodyShort>{skjemanummer}</BodyShort>
        </Column>
      </Row>
      <Row>
        <Column className={styles.mainCol}>
          <FormMetadataEditor form={form} publishedForm={publishedForm} errors={errors} onChange={onChange} />
        </Column>
        <Column>
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
        </Column>
      </Row>
      {lockedFormModalContent}
      <PublishModalComponents
        form={form}
        onPublish={onPublish}
        openPublishSettingModal={openPublishSettingModal}
        setOpenPublishSettingModal={setOpenPublishSettingModal}
      />
    </AppLayout>
  );
}
