import { BodyShort, Button, Heading } from '@navikt/ds-react';
import { makeStyles, useAppConfig, useModal } from '@navikt/skjemadigitalisering-shared-components';
import { useState } from 'react';
import { AppLayout } from '../components/AppLayout';
import ButtonWithSpinner from '../components/ButtonWithSpinner';
import { FormMetadataEditor } from '../components/FormMetaDataEditor/FormMetadataEditor';
import { isFormMetadataValid, validateFormMetadata } from '../components/FormMetaDataEditor/utils/utils';
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
  const {
    title,
    properties: { skjemanummer },
  } = form;
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
          <Button variant="secondary" onClick={() => setOpenPublishSettingModal(true)} type="button" size="small">
            Publiser
          </Button>
          <UnpublishButton onUnpublish={onUnpublish} form={form} />
          {!config.isProdGcp && (
            <ButtonWithSpinner variant="tertiary" onClick={onCopyFromProd} size="small">
              Kopier fra produksjon
            </ButtonWithSpinner>
          )}
          <UserFeedback />
          <FormStatusPanel publishProperties={form.properties} />
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
