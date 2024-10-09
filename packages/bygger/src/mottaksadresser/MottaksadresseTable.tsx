import { Table } from '@navikt/ds-react';
import { Mottaksadresse } from '@navikt/skjemadigitalisering-shared-domain';

interface Props {
  mottaksadresser: Mottaksadresse[];
}

const MottaksadresseTable = ({ mottaksadresser }: Props) => {
  console.log(mottaksadresser);
  return (
    <>
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell scope="col">Enhetsnavn</Table.HeaderCell>
            <Table.HeaderCell scope="col">Adresselinje 2</Table.HeaderCell>
            <Table.HeaderCell scope="col">Postboksadresse</Table.HeaderCell>
            <Table.HeaderCell scope="col">Postnr.</Table.HeaderCell>
            <Table.HeaderCell scope="col">Poststed</Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {mottaksadresser.map(({ data }, i) => {
            console.log(data);
            const { adresselinje1, adresselinje2, adresselinje3, postnummer, poststed } = data;
            return (
              <Table.Row key={i + adresselinje1 + postnummer}>
                <Table.HeaderCell scope="row">{adresselinje1}</Table.HeaderCell>
                <Table.DataCell>{adresselinje2}</Table.DataCell>
                <Table.DataCell>{adresselinje3}</Table.DataCell>
                <Table.DataCell>{postnummer}</Table.DataCell>
                <Table.DataCell>{poststed}</Table.DataCell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table>
    </>
  );
};

export default MottaksadresseTable;
