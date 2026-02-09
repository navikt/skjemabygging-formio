import { FormBuilderOptions, makeStyles, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { DisplayType, Form, formioFormsApiUtils, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { useCallback, useMemo, useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import RowLayout from '../../components/layout/RowLayout';
import Title from '../../components/layout/Title';
import TitleRowLayout from '../../components/layout/TitleRowLayout';
import NavFormBuilder from '../../components/NavFormBuilder';
import SkjemaVisningSelect from '../../components/SkjemaVisningSelect';
import { useForm } from '../../context/old_form/FormContext';
import beforeSaveComponentSettings from '../formBuilderHooks/beforeSaveComponentSettings';
import EditFormSidebar from './EditFormSidebar';

const useStyles = makeStyles({
  formBuilder: {
    gridColumn: '1 / 3',
  },
});

interface EditFormPageProps {
  form: Form;
}

const EditFormPage = ({ form }: EditFormPageProps) => {
  const {
    formState: { publishedForm },
    changeForm,
  } = useForm();
  const {
    title,
    properties: { skjemanummer },
  } = form;
  const isLockedForm = !!form.lock;

  const [display, setDisplay] = useState<DisplayType>('wizard');
  const appConfig = useAppConfig();
  const styles = useStyles();
  const formBuilderOptions = {
    ...FormBuilderOptions,
    formConfig: { publishedForm: appConfig.diffOn ? publishedForm : undefined },
    hooks: { beforeSaveComponentSettings },
    appConfig,
  };

  const handleChange = useCallback(
    (changedForm: NavFormType) => changeForm(formioFormsApiUtils.mapNavFormToForm(changedForm)),
    [changeForm],
  );

  const formioForm: NavFormType = useMemo(
    () => ({ ...formioFormsApiUtils.mapFormToNavForm(form), display }),
    [form, display],
  );

  return (
    <>
      <AppLayout
        navBarProps={{
          formMenu: true,
          formPath: form.path,
        }}
        form={form}
      >
        <TitleRowLayout left={<SkjemaVisningSelect onChange={setDisplay} />}>
          <Title subTitle={skjemanummer} lockedForm={isLockedForm}>
            {title}
          </Title>
        </TitleRowLayout>
        <RowLayout fullWidth={true} right={<EditFormSidebar form={form} />}>
          <NavFormBuilder
            className={styles.formBuilder}
            form={formioForm}
            onChange={handleChange}
            formBuilderOptions={formBuilderOptions}
          />
        </RowLayout>
      </AppLayout>
    </>
  );
};

export default EditFormPage;
