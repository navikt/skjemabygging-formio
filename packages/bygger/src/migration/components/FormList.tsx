import { makeStyles } from "@material-ui/styles";
import { BodyShort, Heading, Table } from "@navikt/ds-react";
import { NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import { DryRunResult } from "../../../types/migration";
import FormStatus, { determineStatus } from "../../Forms/status/FormStatus";

const useStyles = makeStyles({
  container: {
    marginBottom: "2rem",
  },
});

const isNavForm = (element: DryRunResult | NavFormType): element is NavFormType => {
  return !!element["properties"];
};

export const FormList = ({
  heading,
  listElements,
}: {
  heading: string;
  listElements: DryRunResult[] | NavFormType[];
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
            {listElements.map((element, i) => {
              const skjemanummer = isNavForm(element) ? element.properties.skjemanummer : element.skjemanummer;
              return (
                <Table.Row key={i + skjemanummer}>
                  <Table.HeaderCell scope="row">{skjemanummer}</Table.HeaderCell>
                  <Table.DataCell>{element.name}</Table.DataCell>
                  <Table.DataCell>
                    <FormStatus
                      status={determineStatus(isNavForm(element) ? element.properties : element)}
                      size={"small"}
                    />
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
