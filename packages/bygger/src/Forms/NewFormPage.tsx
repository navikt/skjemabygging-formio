import { Button, VStack } from '@navikt/ds-react';
import { useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { Component, NavFormType, navFormUtils, stringUtils } from '@navikt/skjemadigitalisering-shared-domain';
import cloneDeep from 'lodash.clonedeep';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { CreationFormMetadataEditor } from '../components/FormMetaDataEditor/FormMetadataEditor';
import { isFormMetadataValid, validateFormMetadata } from '../components/FormMetaDataEditor/utils/utils';
import RowLayout from '../components/layout/RowLayout';
import SidebarLayout from '../components/layout/SidebarLayout';
import Title from '../components/layout/Title';
import TitleRowLayout from '../components/layout/TitleRowLayout';
import UserFeedback from '../components/UserFeedback';
import { useFeedbackEmit } from '../context/notifications/FeedbackContext';
import { defaultFormFields } from './DefaultForm';

interface Props {
  formio: any;
}

interface State {
  form: NavFormType;
}

interface FormioRoleIds {
  administrator: string;
  authenticated: string;
  everyone: string;
}

type RoleTitle = keyof FormioRoleIds;

type RolesCreator = (...titles: RoleTitle[]) => string[];

class FormioRoleError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export const getRoleMapper =
  (formioRoleIds: FormioRoleIds): RolesCreator =>
  (...roleTitles: RoleTitle[]): string[] => {
    return roleTitles.map((title) => {
      if (!formioRoleIds) {
        throw new FormioRoleError('Formio role ids are not present in config');
      }
      const roleId = formioRoleIds[title];
      if (!roleId) {
        throw new FormioRoleError(`Unknown role with title '${title}'`);
      }
      return roleId;
    });
  };

const NewFormPage: React.FC<Props> = ({ formio }): React.ReactElement => {
  const { config } = useAppConfig();
  const feedbackEmit = useFeedbackEmit();
  const navigate = useNavigate();
  const [state, setState] = useState<State>({
    form: {
      ...navFormUtils.createDefaultForm(config),
      components: defaultFormFields() as Component[],
    },
  });

  const [errors, setErrors] = useState({});

  const setForm = (form: NavFormType) => {
    const newForm = cloneDeep(form);
    setState((oldState) => {
      if (oldState.form.properties.skjemanummer !== newForm.properties.skjemanummer) {
        newForm.name = stringUtils.camelCase(newForm.properties.skjemanummer);
        newForm.path = navFormUtils.toFormPath(newForm.properties.skjemanummer);
      }
      return { form: newForm };
    });
  };
  const validateAndSave = async (form: NavFormType) => {
    const updatedErrors = validateFormMetadata(form, 'create');
    const trimmedFormNumber = state.form.properties.skjemanummer.trim();
    if (isFormMetadataValid(updatedErrors)) {
      setErrors({});
      try {
        const toRoleIds = getRoleMapper(config?.formioRoleIds as FormioRoleIds);
        const createdForm = await formio.saveForm({
          ...state.form,
          properties: {
            ...state.form.properties,
            skjemanummer: trimmedFormNumber,
          },
          access: [
            {
              type: 'read_all',
              roles: toRoleIds('everyone'),
            },
            {
              type: 'update_all',
              roles: toRoleIds('administrator', 'authenticated'),
            },
          ],
        });
        feedbackEmit.success(`Opprettet skjemaet ${form.title}`);
        navigate(`/forms/${form.path}/edit`);
        return createdForm;
      } catch (e: any) {
        console.error(e);
        if (e instanceof FormioRoleError) {
          feedbackEmit.error('Opprettelse av skjema feilet');
          return;
        }
        feedbackEmit.error('Det valgte skjema-nummeret er allerede i bruk.');
      }
    } else {
      setErrors(updatedErrors);
    }
  };

  const onCreate = () => {
    validateAndSave(state.form);
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
              <Button onClick={onCreate} size="small">
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
