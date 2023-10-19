import { Button, Heading } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { Component, NavFormType, navFormUtils, stringUtils } from '@navikt/skjemadigitalisering-shared-domain';
import cloneDeep from 'lodash.clonedeep';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { AppLayout } from '../components/AppLayout';
import { CreationFormMetadataEditor } from '../components/FormMetaDataEditor/FormMetadataEditor';
import { isFormMetadataValid, validateFormMetadata } from '../components/FormMetaDataEditor/utils';
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

interface FormioRole {
  _id: string;
  title: RoleName;
}

type RoleName = 'Administrator' | 'Authenticated' | 'Everyone';

type RolesCreator = (...titles: RoleName[]) => string[];

const ROLE_ID_EVERYONE = '000000000000000000000000';
export const getRoleMapper =
  (formioRoles: FormioRole[]): RolesCreator =>
  (...roleTitles: RoleName[]): string[] => {
    return roleTitles.map((title) => {
      if (title === 'Everyone') {
        return ROLE_ID_EVERYONE;
      }
      return formioRoles.find((role) => role.title === title)!._id;
    });
  };

const NewFormPage: React.FC<Props> = ({ formio }): React.ReactElement => {
  const feedbackEmit = useFeedbackEmit();
  const navigate = useNavigate();
  const styles = useStyles();
  const [state, setState] = useState<State>({
    form: {
      tags: ['nav-skjema', ''],
      type: 'form',
      display: 'wizard',
      name: '',
      title: '',
      path: '',
      properties: {
        skjemanummer: '',
        tema: '',
        innsending: 'PAPIR_OG_DIGITAL',
        ettersending: 'PAPIR_OG_DIGITAL',
        signatures: [{ label: '', description: '', key: uuidv4() }],
      },
      components: defaultFormFields() as unknown as Component[],
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
      const formioRoles = await formio.loadRoles();
      const toRoleIds = getRoleMapper(formioRoles as FormioRole[]);
      return await formio
        .saveForm({
          ...state.form,
          properties: {
            ...state.form.properties,
            skjemanummer: trimmedFormNumber,
          },
          access: [
            {
              type: 'read_all',
              roles: toRoleIds('Everyone'),
            },
            {
              type: 'update_all',
              roles: toRoleIds('Administrator', 'Authenticated'),
            },
          ],
        })
        .then((form: NavFormType) => {
          feedbackEmit.success(`Opprettet skjemaet ${form.title}`);
          navigate(`/forms/${form.path}/edit`);
        })
        .catch((e) => {
          feedbackEmit.error('Det valgte skjema-nummeret er allerede i bruk.');
          console.error(e);
        });
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
