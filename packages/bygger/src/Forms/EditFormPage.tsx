import { PadlockLockedIcon } from '@navikt/aksel-icons';
import { BodyShort, Button, Heading } from '@navikt/ds-react';
import { FormBuilderOptions, makeStyles, useAppConfig, useModal } from '@navikt/skjemadigitalisering-shared-components';
import { I18nTranslations, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
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
  padlockIcon: {
    color: 'black',
    verticalAlign: 'middle',
    marginTop: '-0.5rem', // FIXME
  },
});

interface EditFormPageProps {
  form: NavFormType;
  publishedForm: NavFormType;
  onSave: (form: NavFormType) => void;
  onChange: (form: NavFormType) => void;
  onPublish: (form: NavFormType, translations: I18nTranslations) => void;
  onUnpublish: () => void;
}

export function EditFormPage({ form, publishedForm, onSave, onChange, onPublish, onUnpublish }: EditFormPageProps) {
  const {
    title,
    properties: { skjemanummer, isLockedForm },
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
              {title} {isLockedForm && <PadlockLockedIcon className={styles.padlockIcon} />}
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
            <Button
              variant="secondary"
              onClick={() => setOpenPublishSettingModal(true)}
              type="button"
              icon={isLockedForm && <PadlockLockedIcon />}
            >
              Publiser
            </Button>
            <UnpublishButton onUnpublish={onUnpublish} form={form} />
            <ButtonWithSpinner onClick={() => onSave(form)} icon={isLockedForm && <PadlockLockedIcon />}>
              Lagre
            </ButtonWithSpinner>
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
