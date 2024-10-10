import { Table } from '@navikt/ds-react';
import { Recipient } from '@navikt/skjemadigitalisering-shared-domain';
import { useRecipients } from '../context/recipients/RecipientsContext';
import RecipientRow from './RecipientRow';

interface Props {
  recipients: Recipient[];
}

const RecipientTable = ({ recipients }: Props) => {
  const { newRecipient } = useRecipients();

  return (
    <Table size="small">
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell scope="col">Enhetsnavn</Table.HeaderCell>
          <Table.HeaderCell scope="col">Postboksadresse</Table.HeaderCell>
          <Table.HeaderCell scope="col">Postnr.</Table.HeaderCell>
          <Table.HeaderCell scope="col">Poststed</Table.HeaderCell>
          <Table.HeaderCell scope="col"></Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {recipients.map((recipient) => (
          <RecipientRow key={recipient.recipientId} recipient={recipient} />
        ))}
        {newRecipient && <RecipientRow recipient={newRecipient} />}
      </Table.Body>
    </Table>
  );
};

export default RecipientTable;
