import { PencilIcon } from '@navikt/aksel-icons';
import { Button, Table } from '@navikt/ds-react';
import { Recipient } from '@navikt/skjemadigitalisering-shared-domain';
import useRecipientStyles from './styles';

interface Props {
  value: Partial<Recipient>;
  changeMode: () => void;
}

const RecipientDisplayRow = ({ value, changeMode }: Props) => {
  const styles = useRecipientStyles();
  return (
    <Table.Row shadeOnHover={false}>
      <Table.HeaderCell className={styles.columnLarge} textSize="small" scope="row">
        {value.name}
      </Table.HeaderCell>
      <Table.DataCell className={styles.columnLarge} textSize="small">
        {value.poBoxAddress}
      </Table.DataCell>
      <Table.DataCell className={styles.columnSmall} textSize="small">
        {value.postalCode}
      </Table.DataCell>
      <Table.DataCell textSize="small">{value.postalName}</Table.DataCell>
      <Table.DataCell align="right">
        {
          <Button icon={<PencilIcon aria-hidden />} onClick={changeMode} variant="tertiary" type="button">
            Endre
          </Button>
        }
      </Table.DataCell>
    </Table.Row>
  );
};

export default RecipientDisplayRow;
