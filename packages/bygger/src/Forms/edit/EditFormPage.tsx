import { FormBuilderOptions, makeStyles, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { I18nTranslations, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback } from 'react';
import { AppLayout } from '../../components/AppLayout';
import RowLayout from '../../components/layout/RowLayout';
import Title from '../../components/layout/Title';
import TitleRowLayout from '../../components/layout/TitleRowLayout';
import NavFormBuilder from '../../components/NavFormBuilder';
import SkjemaVisningSelect from '../../components/SkjemaVisningSelect';
import beforeSaveComponentSettings from '../formBuilderHooks/beforeSaveComponentSettings';
import EditFormSidebar from './EditFormSidebar';

const useStyles = makeStyles({
  formBuilder: {
    gridColumn: '1 / 3',
  },
});

interface EditFormPageProps {
  form: NavFormType;
  publishedForm: NavFormType;
  onSave: (form: NavFormType) => Promise<void>;
  onChange: (form: NavFormType) => void;
  onPublish: (form: NavFormType, translations: I18nTranslations) => void;
  onUnpublish: () => void;
}

const EditFormPage = ({ form, publishedForm, onSave, onChange, onPublish, onUnpublish }: EditFormPageProps) => {
  const {
    title,
    properties: { skjemanummer, isLockedForm },
  } = form;

  const appConfig = useAppConfig();
  const styles = useStyles();
  const formBuilderOptions = {
    ...FormBuilderOptions,
    formConfig: { publishedForm },
    hooks: { beforeSaveComponentSettings },
    appConfig,
  };

  const handleChange = useCallback(
    (changedForm: NavFormType) =>
      onChange({
        ...changedForm,
        modified: form.modified,
        properties: { ...changedForm.properties, modified: form.properties.modified },
      }),
    [form.modified, form.properties.modified, onChange],
  );

  return (
    <>
      <AppLayout
        navBarProps={{
          formMenu: true,
          formPath: form.path,
        }}
      >
        <TitleRowLayout left={<SkjemaVisningSelect form={form} onChange={handleChange} />}>
          <Title subTitle={skjemanummer} lockedForm={isLockedForm}>
            {title}
          </Title>
        </TitleRowLayout>
        <RowLayout
          fullWidth={true}
          right={<EditFormSidebar form={form} onSave={onSave} onPublish={onPublish} onUnpublish={onUnpublish} />}
        >
          <NavFormBuilder
            className={styles.formBuilder}
            form={form}
            onChange={handleChange}
            formBuilderOptions={formBuilderOptions}
          />
        </RowLayout>
      </AppLayout>
    </>
  );
};

export default EditFormPage;
