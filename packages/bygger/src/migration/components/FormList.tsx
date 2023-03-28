import { makeStyles } from "@material-ui/styles";
import { BodyShort, Table } from "@navikt/ds-react";
import { NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import { Undertittel } from "nav-frontend-typografi";
import React from "react";
import { FormMigrationLogData } from "../../../types/migration";
import FormStatus, { determineStatus } from "../../Forms/status/FormStatus";

const useStyles = makeStyles({
  container: {
    marginBottom: "2rem",
  },
});

const isNavForm = (element: FormMigrationLogData | NavFormType): element is NavFormType => {
  return !!element["properties"];
};

export const FormList = ({
  heading,
  listElements,
}: {
  heading: string;
  listElements: FormMigrationLogData[] | NavFormType[];
}) => {
  const styles = useStyles();
  return (
    <div className={styles.container}>
      <Undertittel className="margin-bottom-default">{heading}</Undertittel>
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
