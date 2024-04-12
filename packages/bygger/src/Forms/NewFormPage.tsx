import { Button, Heading } from '@navikt/ds-react';
import { makeStyles, useAppConfig } from '@navikt/skjemadigitalisering-shared-components';
import { Component, NavFormType, navFormUtils, stringUtils } from '@navikt/skjemadigitalisering-shared-domain';
import cloneDeep from 'lodash.clonedeep';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../components/AppLayout';
import { CreationFormMetadataEditor } from '../components/FormMetaDataEditor/FormMetadataEditor';
import { isFormMetadataValid, validateFormMetadata } from '../components/FormMetaDataEditor/utils/utils';
import UserFeedback from '../components/UserFeedback';
import Column from '../components/layout/Column';
import Row from '../components/layout/Row';
import { useFeedbackEmit } from '../context/notifications/FeedbackContext';
import { defaultFormFields } from './DefaultForm';

const useStyles = makeStyles({
  centerColumn: {
    gridColumn: '2 / 3',
  },
});

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
  const styles = useStyles();
  const [state, setState] = useState<State>({
    form: {
      ...navFormUtils.createDefaultForm(),
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
    <AppLayout navBarProps={{ title: 'Opprett nytt skjema' }}>
      <Row>
        <Column className={styles.centerColumn}>
          <Heading level="1" size="xlarge">
            Opprett nytt skjema
          </Heading>
        </Column>
      </Row>
      <Row>
        <Column className={styles.centerColumn}>
          <CreationFormMetadataEditor form={state.form} onChange={setForm} errors={errors} />
        </Column>
        <Column>
          <Button onClick={onCreate}>Opprett</Button>
          <UserFeedback />
        </Column>
      </Row>
    </AppLayout>
  );
};

export default NewFormPage;
