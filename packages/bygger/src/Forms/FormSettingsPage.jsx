import { Button, Heading } from '@navikt/ds-react';
import { makeStyles, useAppConfig, useModal } from '@navikt/skjemadigitalisering-shared-components';
import { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import { FormMetadataEditor } from '../components/FormMetaDataEditor/FormMetadataEditor';
import { isFormMetadataValid, validateFormMetadata } from '../components/FormMetaDataEditor/utils/utils';
import PrimaryButtonWithSpinner from '../components/PrimaryButtonWithSpinner';
import UserFeedback from '../components/UserFeedback';
import Column from '../components/layout/Column';
import Row from '../components/layout/Row';
import PublishModalComponents from './publish/PublishModalComponents';
import FormStatusPanel from './status/FormStatusPanel';
import UnpublishButton from './unpublish/UnpublishButton';

const useStyles = makeStyles({
  mainCol: {
    gridColumn: '2 / 3',
  },
});

export function FormSettingsPage({ form, publishedForm, onSave, onChange, onPublish, onUnpublish, onCopyFromProd }) {
  const title = form.title;
  const [openPublishSettingModal, setOpenPublishSettingModal] = useModal();
  const styles = useStyles();
  const [errors, setErrors] = useState({});
  const { config } = useAppConfig();

  const validateAndSave = async (form) => {
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
        title: 'Skjemainnstillinger',
        visSkjemaMeny: true,
        formPath: form.path,
      }}
    >
      <Row className={styles.titleRow}>
        <Column className={styles.mainCol}>
          <Heading level="1" size="xlarge">
            {title}
          </Heading>
        </Column>
      </Row>
      <Row>
        <Column className={styles.mainCol}>
          <FormMetadataEditor form={form} publishedForm={publishedForm} errors={errors} onChange={onChange} />
        </Column>
        <Column>
          <Button variant="secondary" onClick={() => setOpenPublishSettingModal(true)} type="button">
            Publiser
          </Button>
          <UnpublishButton onUnpublish={onUnpublish} form={form} />
          <PrimaryButtonWithSpinner onClick={() => validateAndSave(form)}>Lagre</PrimaryButtonWithSpinner>
          {!config.isProdGcp && (
            <PrimaryButtonWithSpinner onClick={onCopyFromProd}>Kopier fra produksjon</PrimaryButtonWithSpinner>
          )}
          <FormStatusPanel publishProperties={form.properties} />
          <UserFeedback />
        </Column>
      </Row>

      <PublishModalComponents
        form={form}
        onPublish={onPublish}
        openPublishSettingModal={openPublishSettingModal}
        setOpenPublishSettingModal={setOpenPublishSettingModal}
      />
    </AppLayout>
  );
}
