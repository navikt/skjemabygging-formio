import { Alert, BodyShort, Box, Button, Checkbox, Heading, Table } from '@navikt/ds-react';
import { ConfirmationModal, makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { useReducer, useState } from 'react';
import FormStatus from '../../Forms/status/FormStatus';
import { determineStatusFromForm } from '../../Forms/status/utils';
import { bulkPublish } from '../api';
import FormList from './FormList';

type State = Record<string, boolean>;
type Action = { type: 'check' | 'uncheck'; payload: string } | { type: 'init'; payload: Form[] };

function init(forms: Form[]): State {
  return forms.reduce((acc, form) => ({ ...acc, [form.path]: true }), {});
}

function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'init':
      return init(action.payload);
    case 'check':
      return { ...state, [action.payload]: true };
    case 'uncheck':
      return { ...state, [action.payload]: false };
    default:
      throw new Error();
  }
}

type StatusState = Record<string, 'ok' | 'error'>;
type PublishStatus = { form: Pick<Form, 'path'>; status: 'ok' | 'error' };
type StatusAction = { type: 'init'; payload: PublishStatus[] };

function initStatus(list: PublishStatus[]): StatusState {
  return list.reduce((acc, publishStatus) => ({ ...acc, [publishStatus.form.path]: publishStatus.status }), {});
}

function statusReducer(_state: StatusState, action: StatusAction) {
  switch (action.type) {
    case 'init':
      return initStatus(action.payload);
    default:
      throw new Error();
  }
}

const useStyles = makeStyles({
  table: {
    marginTop: '2rem',
    marginBottom: '2rem',
  },
  checkBoxCell: {
    maxWidth: '4rem',
  },
});

interface Props {
  forms: Form[];
}

const BulkPublishPanel = ({ forms }: Props) => {
  const styles = useStyles();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [state, dispatch] = useReducer(reducer, {});
  const [statusState, dispatchStatus] = useReducer(statusReducer, {});

  const onBulkPublish = async (formPaths: string[]) => {
    return await bulkPublish({ formPaths });
  };

  const willBePublished = forms.filter((form) => state[form.path]);
  const willNotBePublished = forms.filter((form) => !state[form.path]);
  return (
    <>
      <Box padding="space-4" borderRadius="2">
        <Heading level="3" size="medium">
          Skjemaer som er klare for publisering
        </Heading>
        <BodyShort>Her kan du velge skjemaer du ønsker å publisere samlet</BodyShort>
        <Alert variant="warning">
          Merk at oversettelser ikke migreres, eller publiseres. Hvis du har gjort endringer som vil påvirke
          oversettelser, for eksempel "label", bør du kontrollere skjemaoversettelser før du publiserer.
        </Alert>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setErrorMessage(undefined);
            setIsModalOpen(true);
          }}
        >
          <Table className={styles.table} size="small">
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell scope="col">Skjemanummer</Table.HeaderCell>
                <Table.HeaderCell scope="col">Name</Table.HeaderCell>
                <Table.HeaderCell scope="col">Status</Table.HeaderCell>
                <Table.HeaderCell scope="col" className={styles.checkBoxCell}>
                  Skal publiseres
                </Table.HeaderCell>
                <Table.HeaderCell scope="col" className={styles.checkBoxCell}>
                  Publisert?
                </Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {forms.map((form, i) => {
                return (
                  <Table.Row key={i + form.skjemanummer}>
                    <Table.HeaderCell scope="row">{form.skjemanummer}</Table.HeaderCell>
                    <Table.DataCell>{form.title}</Table.DataCell>
                    <Table.DataCell>
                      <FormStatus status={determineStatusFromForm(form)} size={'small'} />
                    </Table.DataCell>
                    <Table.DataCell className={styles.checkBoxCell}>
                      {
                        <Checkbox
                          hideLabel
                          checked={state[form.path] || false}
                          onChange={(event) => {
                            const type = event.target.checked ? 'check' : 'uncheck';
                            dispatch({ type, payload: form.path });
                          }}
                        >
                          {form.title}
                        </Checkbox>
                      }
                    </Table.DataCell>
                    <Table.DataCell>{statusState[form.path]}</Table.DataCell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
          <Button>Publiser nå</Button>
          {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
        </form>
      </Box>
      <ConfirmationModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={async () => {
          const responseBody = await onBulkPublish(
            Object.entries(state).flatMap(([path, selected]) => (selected ? [path] : [])),
          );
          if (!responseBody.githubCommit) {
            setErrorMessage('Feil ved publisering til Github');
          } else {
            dispatchStatus({ type: 'init', payload: responseBody.bulkPublicationResult });
          }
        }}
        texts={{
          title: 'Bekreft publisering',
          confirm: 'Bekreft publisering',
          cancel: 'Avbryt publisering',
        }}
      >
        <FormList heading={'Skjemaer som vil bli publisert'} listElements={willBePublished} />
        <FormList heading={'Skjemaer som ikke vil bli publisert'} listElements={willNotBePublished} />
      </ConfirmationModal>
    </>
  );
};

export default BulkPublishPanel;
