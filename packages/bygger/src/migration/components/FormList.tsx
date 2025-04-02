import { BodyShort, Heading, Table } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { FormMigrationLogData } from '../../../types/migration';
import FormStatus from '../../Forms/status/FormStatus';
import { determineStatus } from '../../Forms/status/utils';

const useStyles = makeStyles({
  container: {
    marginBottom: '2rem',
  },
});

export const FormList = ({
  heading,
  listElements,
}: {
  heading: string;
  listElements: FormMigrationLogData[] | Form[];
}) => {
  const styles = useStyles();
  return (
    <div className={styles.container}>
      <Heading level="2" size="small">
        {heading}
      </Heading>
      {listElements.length === 0 ? (
        <BodyShort spacing>N/A</BodyShort>
      ) : (
        <Table size="small">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell scope="col">Skjemanr.</Table.HeaderCell>
              <Table.HeaderCell scope="col">Name</Table.HeaderCell>
              <Table.HeaderCell scope="col">Status</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {listElements.map((element: FormMigrationLogData | Form, i) => {
              const skjemanummer = element.skjemanummer;
              return (
                <Table.Row key={i + skjemanummer}>
                  <Table.HeaderCell scope="row">{skjemanummer}</Table.HeaderCell>
                  <Table.DataCell>{element.title}</Table.DataCell>
                  <Table.DataCell>
                    <FormStatus status={determineStatus(element)} size={'small'} />
                  </Table.DataCell>
                </Table.Row>
              );
            })}
          </Table.Body>
        </Table>
      )}
    </div>
  );
};

export default FormList;
