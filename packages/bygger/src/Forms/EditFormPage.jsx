import { BodyShort, Button, Heading } from '@navikt/ds-react';
import { FormBuilderOptions, makeStyles, useAppConfig, useModal } from '@navikt/skjemadigitalisering-shared-components';
import { AppLayout } from '../components/AppLayout';
import ButtonWithSpinner from '../components/ButtonWithSpinner';
import NavFormBuilder from '../components/NavFormBuilder';
import SkjemaVisningSelect from '../components/SkjemaVisningSelect';
import UserFeedback from '../components/UserFeedback';
import Column from '../components/layout/Column';
import Row from '../components/layout/Row';
import beforeSaveComponentSettings from './formBuilderHooks/beforeSaveComponentSettings';
import PublishModalComponents from './publish/PublishModalComponents';
import FormStatusPanel from './status/FormStatusPanel';
import UnpublishButton from './unpublish/UnpublishButton';

const useStyles = makeStyles({
  formBuilder: {
    gridColumn: '1 / 3',
  },
  centerColumn: {
    gridColumn: '2 / 3',
  },
});

export function EditFormPage({ form, publishedForm, onSave, onChange, onPublish, onUnpublish }) {
  const {
    title,
    properties: { skjemanummer },
  } = form;
  const [openPublishSettingModal, setOpenPublishSettingModal] = useModal();
  const appConfig = useAppConfig();
  const styles = useStyles();
  const formBuilderOptions = {
    ...FormBuilderOptions,
    formConfig: { publishedForm },
    hooks: { beforeSaveComponentSettings },
    appConfig,
  };
  return (
    <>
      <AppLayout
        navBarProps={{
          visSkjemaMeny: true,
          formPath: form.path,
        }}
      >
        <Row>
          <SkjemaVisningSelect form={form} onChange={onChange} />
          <Column className={styles.centerColumn}>
            <Heading level="1" size="xlarge">
              {title}
            </Heading>
            <BodyShort>{skjemanummer}</BodyShort>
          </Column>
        </Row>
        <Row>
          <NavFormBuilder
            className={styles.formBuilder}
            form={form}
            onChange={onChange}
            formBuilderOptions={formBuilderOptions}
          />
          <Column>
            <ButtonWithSpinner onClick={() => onSave(form)} size="small">
              Lagre
            </ButtonWithSpinner>
            <Button variant="secondary" onClick={() => setOpenPublishSettingModal(true)} type="button" size="small">
              Publiser
            </Button>
            <UnpublishButton onUnpublish={onUnpublish} form={form} />
            <UserFeedback />
            <FormStatusPanel publishProperties={form.properties} />
          </Column>
        </Row>
      </AppLayout>

      <PublishModalComponents
        form={form}
        onPublish={onPublish}
        openPublishSettingModal={openPublishSettingModal}
        setOpenPublishSettingModal={setOpenPublishSettingModal}
      />
    </>
  );
}
