import { useAppConfig, useModal } from '@navikt/skjemadigitalisering-shared-components';
import { NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { FormMetadataEditor } from '../../components/FormMetaDataEditor/FormMetadataEditor';
import { isFormMetadataValid, validateFormMetadata } from '../../components/FormMetaDataEditor/utils/utils';
import RowLayout from '../../components/layout/RowLayout';
import Title from '../../components/layout/Title';
import TitleRowLayout from '../../components/layout/TitleRowLayout';
import { useForm } from '../../context/form/FormContext';
import PublishModalComponents from '../publish/PublishModalComponents';
import FormSettingsSidebar from './FormSettingsSidebar';

interface FormSettingsPageProps {
  form: NavFormType;
  publishedForm: NavFormType;
}

export function FormSettingsPage({ form, publishedForm }: FormSettingsPageProps) {
  const { saveForm, changeForm } = useForm();
  const {
    title,
    properties: { skjemanummer },
  } = form;
  const isLockedForm = form.properties.isLockedForm;
  const [openPublishSettingModal, setOpenPublishSettingModal] = useModal();

  const [errors, setErrors] = useState({});
  const { config } = useAppConfig();

  // Set default properties if they are not set
  const setDefaultProperties = (form: NavFormType) => {
    if (!form.properties.mellomlagringDurationDays) {
      form.properties.mellomlagringDurationDays = (config?.mellomlagringDurationDays as string) ?? '28';
    }
    return form;
  };

  const validateAndSave = async (form: NavFormType) => {
    const updatedForm = setDefaultProperties(form);
    const updatedErrors = validateFormMetadata(updatedForm, 'edit');
    if (isFormMetadataValid(updatedErrors)) {
      setErrors({});
      saveForm(updatedForm);
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
      <TitleRowLayout>
        <Title subTitle={skjemanummer} lockedForm={isLockedForm}>
          {title}
        </Title>
      </TitleRowLayout>
      <RowLayout
        right={
          <FormSettingsSidebar
            form={form}
            validateAndSave={validateAndSave}
            setOpenPublishSettingModal={setOpenPublishSettingModal}
          />
        }
      >
        <FormMetadataEditor form={form} publishedForm={publishedForm} onChange={changeForm} errors={errors} />
      </RowLayout>
      <PublishModalComponents
        form={form}
        openPublishSettingModal={openPublishSettingModal}
        setOpenPublishSettingModal={setOpenPublishSettingModal}
      />
    </AppLayout>
  );
}
