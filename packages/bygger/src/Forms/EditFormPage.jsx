import { BodyShort, Button, Heading } from '@navikt/ds-react';
import { FormBuilderOptions, makeStyles, useModal } from '@navikt/skjemadigitalisering-shared-components';
import { AppLayout } from '../components/AppLayout';
import NavFormBuilder from '../components/NavFormBuilder';
import PrimaryButtonWithSpinner from '../components/PrimaryButtonWithSpinner';
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
  const styles = useStyles();
  const formBuilderOptions = {
    ...FormBuilderOptions,
    formConfig: { publishedForm },
    hooks: { beforeSaveComponentSettings },
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
            <Button variant="secondary" onClick={() => setOpenPublishSettingModal(true)} type="button">
              Publiser
            </Button>
            <UnpublishButton onUnpublish={onUnpublish} form={form} />
            <PrimaryButtonWithSpinner onClick={() => onSave(form)}>Lagre</PrimaryButtonWithSpinner>
            <FormStatusPanel publishProperties={form.properties} />
            <UserFeedback />
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
