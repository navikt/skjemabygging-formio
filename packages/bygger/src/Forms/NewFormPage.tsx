import { Button, VStack } from '@navikt/ds-react';
import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { Component, Form, navFormUtils, stringUtils } from '@navikt/skjemadigitalisering-shared-domain';
import cloneDeep from 'lodash.clonedeep';
import { useState } from 'react';
import { useNavigate } from 'react-router';
import useForms from '../api/useForms';
import { AppLayout } from '../components/AppLayout';
import { CreationFormMetadataEditor } from '../components/FormMetaDataEditor/FormMetadataEditor';
import { isFormMetadataValid, validateFormMetadata } from '../components/FormMetaDataEditor/utils/utils';
import RowLayout from '../components/layout/RowLayout';
import SidebarLayout from '../components/layout/SidebarLayout';
import Title from '../components/layout/Title';
import TitleRowLayout from '../components/layout/TitleRowLayout';
import UserFeedback from '../components/UserFeedback';
import { defaultFormFields } from './DefaultForm';

interface State {
  form: Form;
}

const NewFormPage = () => {
  const { config } = useAppConfig();
  const { createForm } = useForms();
  const navigate = useNavigate();
  const [state, setState] = useState<State>({
    form: {
      ...navFormUtils.createDefaultForm(config),
      components: defaultFormFields() as Component[],
    },
  });

  const [errors, setErrors] = useState({});

  const setForm = (form: Form) => {
    const newForm = cloneDeep(form);
    setState((oldState) => {
      if (oldState.form.skjemanummer !== newForm.skjemanummer) {
        newForm.name = stringUtils.camelCase(newForm.skjemanummer);
        newForm.path = navFormUtils.toFormPath(newForm.skjemanummer);
      }
      return { form: newForm };
    });
  };
  const validateAndSave = async () => {
    const updatedErrors = validateFormMetadata(state.form, 'create');
    const trimmedFormNumber = state.form.skjemanummer.trim();
    if (isFormMetadataValid(updatedErrors)) {
      setErrors({});
      const createdForm = await createForm({
        ...state.form,
        skjemanummer: trimmedFormNumber,
        properties: {
          ...state.form.properties,
          skjemanummer: trimmedFormNumber,
        },
      });

      if (createdForm) {
        navigate(`/forms/${createdForm.path}/edit`);
        return createdForm;
      }
    } else {
      setErrors(updatedErrors);
    }
  };

  return (
    <AppLayout>
      <TitleRowLayout>
        <Title>Opprett nytt skjema</Title>
      </TitleRowLayout>
      <RowLayout
        right={
          <SidebarLayout noScroll={true}>
            <VStack gap="1">
              <Button onClick={validateAndSave} size="small">
                Opprett
              </Button>
              <UserFeedback />
            </VStack>
          </SidebarLayout>
        }
      >
        <CreationFormMetadataEditor form={state.form} onChange={setForm} errors={errors} />
      </RowLayout>
    </AppLayout>
  );
};

export default NewFormPage;
