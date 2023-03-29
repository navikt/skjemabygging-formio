import { makeStyles } from "@material-ui/styles";
import { Alert, BodyShort, Button, Checkbox, Heading, Panel, Table } from "@navikt/ds-react";
import { Modal } from "@navikt/skjemadigitalisering-shared-components";
import { NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import Formiojs from "formiojs/Formio";
import { useEffect, useReducer, useState } from "react";
import FormStatus, { determineStatus } from "../../Forms/status/FormStatus";
import { bulkPublish } from "../api";
import FormList from "./FormList";

type State = Record<string, boolean>;
type Action = { type: "check" | "uncheck"; payload: string } | { type: "init"; payload: NavFormType[] };

function init(forms: NavFormType[]): State {
  return forms.reduce((acc, form) => ({ ...acc, [form.path]: true }), {});
}

function reducer(state: State, action: Action) {
  switch (action.type) {
    case "init":
      return init(action.payload);
    case "check":
      return { ...state, [action.payload]: true };
    case "uncheck":
      return { ...state, [action.payload]: false };
    default:
      throw new Error();
  }
}

const useStyles = makeStyles({
  table: {
    marginTop: "2rem",
    marginBottom: "2rem",
  },
  checkBoxCell: {
    maxWidth: "4rem",
  },
});

interface Props {
  forms: NavFormType[];
}

const BulkPublishPanel = ({ forms }: Props) => {
  const styles = useStyles();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [state, dispatch] = useReducer(reducer, {});

  useEffect(() => {
    dispatch({
      type: "init",
      payload: forms.filter((form) => {
        const status = determineStatus(form.properties);
        return status === "PENDING" || status === "PUBLISHED";
      }),
    });
  }, [forms]);

  const onBulkPublish = async (formPaths) => {
    setIsLoading(true);
    await bulkPublish(Formiojs.getToken(), { formPaths });
    setIsLoading(false);
  };

  const willBePublished = forms.filter((form) => state[form.path]);
  const willNotBePublished = forms.filter((form) => !state[form.path]);

  return (
    <>
      <Panel className="margin-bottom-double">
        <Heading level="3" size="medium">
          Disse skjemaene ble migrert
        </Heading>
        <BodyShort>Her kan du velge skjemaer du ønsker å publisere samlet</BodyShort>
        <Alert variant="warning">
          <p>
            Merk at oversettelser ikke migreres, eller publiseres. Hvis du har gjort endringer som vil påvirke
            oversettelser, for eksempel "label", bør du kontrollere skjemaoversettelser før du publiserer.
          </p>
        </Alert>
        <form
          onSubmit={(event) => {
            event.preventDefault();
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
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {forms.map((form, i) => {
                return (
                  <Table.Row key={i + form.properties.skjemanummer}>
                    <Table.HeaderCell scope="row">{form.properties.skjemanummer}</Table.HeaderCell>
                    <Table.DataCell>{form.name}</Table.DataCell>
                    <Table.DataCell>
                      {<FormStatus status={determineStatus(form.properties)} size={"small"} />}
                    </Table.DataCell>
                    <Table.DataCell className={styles.checkBoxCell}>
                      {
                        <Checkbox
                          hideLabel
                          checked={state[form.path] || false}
                          onChange={(event) => {
                            if (event.target.checked) {
                              dispatch({ type: "check", payload: form.path });
                            } else {
                              dispatch({ type: "uncheck", payload: form.path });
                            }
                          }}
                        >
                          {form.name}
                        </Checkbox>
                      }
                    </Table.DataCell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
          <Button>Publiser nå</Button>
        </form>
      </Panel>
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} ariaLabel="Bekreft publisering">
        <FormList heading={"Skjemaer som vil bli publisert"} listElements={willBePublished} />
        <FormList heading={"Skjemaer som ikke vil bli publisert"} listElements={willNotBePublished} />
        <ul className="list-inline">
          <li className="list-inline-item">
            <Button
              loading={isLoading}
              onClick={async () => {
                await onBulkPublish(Object.entries(state).flatMap(([path, selected]) => (selected ? [path] : [])));
                setIsModalOpen(false);
              }}
            >
              Bekreft publisering
            </Button>
          </li>
          <li className="list-inline-item">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setIsModalOpen(false);
              }}
            >
              Avbryt publisering
            </Button>
          </li>
        </ul>
      </Modal>
    </>
  );
};

export default BulkPublishPanel;
