import { useAppConfig, useModal } from '@navikt/skjemadigitalisering-shared-components';
import { FormPropertiesType, I18nTranslations, NavFormType } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { FormMetadataEditor } from '../../components/FormMetaDataEditor/FormMetadataEditor';
import { isFormMetadataValid, validateFormMetadata } from '../../components/FormMetaDataEditor/utils/utils';
import RowLayout from '../../components/layout/RowLayout';
import Title from '../../components/layout/Title';
import TitleRowLayout from '../../components/layout/TitleRowLayout';
import PublishModalComponents from '../publish/PublishModalComponents';
import FormSettingsSidebar from './FormSettingsSidebar';

interface FormSettingsPageProps {
  form: NavFormType;
  publishedForm: NavFormType;
  onSave: (form: NavFormType) => void;
  onChange: (form: NavFormType) => void;
  onPublish: (form: NavFormType, translations: I18nTranslations) => void;
  onUnpublish: () => void;
  onCopyFromProd: () => void;
  onChangeLockedState: (properties: Partial<FormPropertiesType>) => Promise<void>;
}

export function FormSettingsPage({
  form,
  publishedForm,
  onSave,
  onChange,
  onPublish,
  onUnpublish,
  onCopyFromProd,
  onChangeLockedState,
}: FormSettingsPageProps) {
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
      onSave(updatedForm);
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
            onPublish={onPublish}
            onUnpublish={onUnpublish}
            onCopyFromProd={onCopyFromProd}
            onChangeLockedState={onChangeLockedState}
            setOpenPublishSettingModal={setOpenPublishSettingModal}
          />
        }
      >
        <FormMetadataEditor form={form} publishedForm={publishedForm} errors={errors} onChange={onChange} />
      </RowLayout>
      <PublishModalComponents
        form={form}
        onPublish={onPublish}
        openPublishSettingModal={openPublishSettingModal}
        setOpenPublishSettingModal={setOpenPublishSettingModal}
      />
    </AppLayout>
  );
}
