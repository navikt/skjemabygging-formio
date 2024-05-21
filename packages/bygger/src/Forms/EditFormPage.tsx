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
import useLockedFormModal from '../hooks/useLockedFormModal';
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
    position: 'relative',
    top: '0.4rem',
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
  const { lockedFormModalContent, openLockedFormModal } = useLockedFormModal(form);

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
              {title} {isLockedForm && <PadlockLockedIcon title="Skjemaet er låst" className={styles.padlockIcon} />}
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
              onClick={() => {
                if (isLockedForm) {
                  openLockedFormModal();
                } else {
                  setOpenPublishSettingModal(true);
                }
              }}
              type="button"
              icon={isLockedForm && <PadlockLockedIcon title="Skjemaet er låst" />}
            >
              Publiser
            </Button>
            <UnpublishButton onUnpublish={onUnpublish} form={form} />
            <ButtonWithSpinner
              onClick={() => {
                if (isLockedForm) {
                  openLockedFormModal();
                } else {
                  onSave(form);
                }
              }}
              icon={isLockedForm && <PadlockLockedIcon title="Skjemaet er låst" />}
            >
              Lagre
            </ButtonWithSpinner>
            <UserFeedback />
            <FormStatusPanel publishProperties={form.properties} />
          </Column>
        </Row>
      </AppLayout>
      {lockedFormModalContent}

      <PublishModalComponents
        form={form}
        onPublish={onPublish}
        openPublishSettingModal={openPublishSettingModal}
        setOpenPublishSettingModal={setOpenPublishSettingModal}
      />
    </>
  );
}
