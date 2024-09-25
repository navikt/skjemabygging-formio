import { FormBuilderOptions, makeStyles, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback } from 'react';
import { AppLayout } from '../../components/AppLayout';
import RowLayout from '../../components/layout/RowLayout';
import Title from '../../components/layout/Title';
import TitleRowLayout from '../../components/layout/TitleRowLayout';
import NavFormBuilder from '../../components/NavFormBuilder';
import SkjemaVisningSelect from '../../components/SkjemaVisningSelect';
import { useForm } from '../../context/form/FormContext';
import beforeSaveComponentSettings from '../formBuilderHooks/beforeSaveComponentSettings';
import EditFormSidebar from './EditFormSidebar';

const useStyles = makeStyles({
  formBuilder: {
    gridColumn: '1 / 3',
  },
});

interface EditFormPageProps {
  form: NavFormType;
  publishedForm?: NavFormType;
}

const EditFormPage = ({ form, publishedForm }: EditFormPageProps) => {
  const { changeForm } = useForm();
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
      changeForm({
        ...changedForm,
        modified: form.modified,
        properties: { ...changedForm.properties, modified: form.properties.modified },
      }),
    [form.modified, form.properties.modified, changeForm],
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
        <RowLayout fullWidth={true} right={<EditFormSidebar form={form} />}>
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
