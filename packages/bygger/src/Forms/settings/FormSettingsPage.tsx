import { Alert, Heading } from '@navikt/ds-react';
import { useAppConfig, useModal } from '@navikt/skjemadigitalisering-shared-components';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { useState } from 'react';
import { AppLayout } from '../../components/AppLayout';
import { FormMetadataEditor } from '../../components/FormMetaDataEditor/FormMetadataEditor';
import { isFormMetadataValid, validateFormMetadata } from '../../components/FormMetaDataEditor/utils/utils';
import RowLayout from '../../components/layout/RowLayout';
import Title from '../../components/layout/Title';
import TitleRowLayout from '../../components/layout/TitleRowLayout';
import { useForm } from '../../context/old_form/FormContext';
import RecipientsProvider from '../../context/recipients/RecipientsContext';
import DeleteFormModal from '../delete/DeleteFormModal';
import PublishModalComponents from '../publish/PublishModalComponents';
import FormSettingsSidebar from './FormSettingsSidebar';

interface FormSettingsPageProps {
  form: Form;
}

export function FormSettingsPage({ form }: FormSettingsPageProps) {
  const { saveForm, changeForm } = useForm();
  const {
    title,
    properties: { skjemanummer },
  } = form;
  const isLockedForm = !!form.lock;
  const [openPublishSettingModal, setOpenPublishSettingModal] = useModal();
  const [openDeleteFormModal, setOpenDeleteFormModal] = useModal();

  const [errors, setErrors] = useState({});
  const { config } = useAppConfig();

  // Set default properties if they are not set
  const setDefaultProperties = (form: Form) => {
    const { mellomlagringDurationDays, uxSignalsId, submissionTypes } = form.properties;
    if (!mellomlagringDurationDays) {
      form.properties.mellomlagringDurationDays = (config?.mellomlagringDurationDays as string) ?? '28';
    }
    if (uxSignalsId && submissionTypes.length < 2) {
      form.properties.uxSignalsSubmissionTypes = submissionTypes;
    }
    return form;
  };

  const validateAndSave = async (form: Form) => {
    const updatedForm = setDefaultProperties(form);
    const updatedErrors = validateFormMetadata(updatedForm, 'edit');
    if (isFormMetadataValid(updatedErrors)) {
      setErrors({});
      await saveForm(updatedForm);
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
      form={form}
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
            setOpenDeleteFormModal={setOpenDeleteFormModal}
          />
        }
      >
        {isLockedForm && (
          <Alert variant="warning" size="medium">
            <Heading spacing size="small" level="2">
              Skjemaet er låst
            </Heading>
            {form?.lock?.reason}
          </Alert>
        )}
        <RecipientsProvider>
          <FormMetadataEditor form={form} onChange={changeForm} errors={errors} />
        </RecipientsProvider>
      </RowLayout>
      <PublishModalComponents
        form={form}
        openPublishSettingModal={openPublishSettingModal}
        setOpenPublishSettingModal={setOpenPublishSettingModal}
      />
      <DeleteFormModal
        form={form}
        openDeleteFormModal={openDeleteFormModal}
        setOpenDeleteFormModal={setOpenDeleteFormModal}
      />
    </AppLayout>
  );
}
