import { Table } from '@navikt/ds-react';
import { Recipient } from '@navikt/skjemadigitalisering-shared-domain';

interface Props {
  recipients: Recipient[];
}

const RecipientTable = ({ recipients }: Props) => {
  console.log(recipients);
  return (
    <Table>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell scope="col">Enhetsnavn</Table.HeaderCell>
          <Table.HeaderCell scope="col">Postboksadresse</Table.HeaderCell>
          <Table.HeaderCell scope="col">Postnr.</Table.HeaderCell>
          <Table.HeaderCell scope="col">Poststed</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {recipients.map(({ recipientId, name, poBoxAddress, postalCode, postalName }) => {
          return (
            <Table.Row key={recipientId}>
              <Table.HeaderCell scope="row">{name}</Table.HeaderCell>
              <Table.DataCell>{poBoxAddress}</Table.DataCell>
              <Table.DataCell>{postalCode}</Table.DataCell>
              <Table.DataCell>{postalName}</Table.DataCell>
            </Table.Row>
          );
        })}
      </Table.Body>
    </Table>
  );
};

export default RecipientTable;
