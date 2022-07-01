import { makeStyles } from "@material-ui/styles";
import { Modal } from "@navikt/skjemadigitalisering-shared-components";
import { NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import Formiojs from "formiojs/Formio";
import AlertStripe from "nav-frontend-alertstriper";
import { Knapp } from "nav-frontend-knapper";
import Panel from "nav-frontend-paneler";
import { Checkbox } from "nav-frontend-skjema";
import { Undertekst, Undertittel } from "nav-frontend-typografi";
import React, { useEffect, useReducer, useState } from "react";
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
  noBullets: {
    listStyleType: "none",
  },
  listElement: {
    marginBottom: "1rem",
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
    dispatch({ type: "init", payload: forms });
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
        <Undertittel tag="h3">Disse skjemaene ble migrert</Undertittel>
        <Undertekst className={"margin-bottom-default"}>
          Her kan du velge skjemaer du ønsker å publisere samlet
        </Undertekst>
        <AlertStripe type={"advarsel"}>
          <p>
            Merk at oversettelser ikke migreres, eller publiseres. Hvis du har gjort endringer som vil påvirke
            oversettelser, for eksempel "label", bør du kontrollere skjemaoversettelser og migrere manuelt.
          </p>
          <p>
            Skjemaer listet opp her, er ikke nødvendigvis publisert til nav.no per i dag. Du må selv kontrollere om et
            gitt skjema faktisk skal publiseres.
          </p>
        </AlertStripe>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setIsModalOpen(true);
          }}
        >
          <ul className={styles.noBullets}>
            {forms.map((form) => (
              <li className={styles.listElement} key={form.properties.skjemanummer}>
                <Checkbox
                  label={`${form.properties.skjemanummer} - ${form.name} (${form.path})`}
                  checked={state[form.path] || false}
                  onChange={(event) => {
                    if (event.target.checked) {
                      dispatch({ type: "check", payload: form.path });
                    } else {
                      dispatch({ type: "uncheck", payload: form.path });
                    }
                  }}
                />
              </li>
            ))}
          </ul>
          <Knapp type="hoved">Publiser nå</Knapp>
        </form>
      </Panel>
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} ariaLabel="Bekreft publisering">
        <FormList heading={"Skjemaer som vil bli publisert"} listElements={willBePublished} />
        <FormList heading={"Skjemaer som ikke vil bli publisert"} listElements={willNotBePublished} />
        <ul className="list-inline">
          <li className="list-inline-item">
            <Knapp
              spinner={isLoading}
              onClick={async () => {
                await onBulkPublish(Object.entries(state).flatMap(([path, selected]) => (selected ? [path] : [])));
                setIsModalOpen(false);
              }}
              htmlType="button"
            >
              Bekreft publisering
            </Knapp>
          </li>
          <li className="list-inline-item">
            <Knapp
              onClick={() => {
                setIsModalOpen(false);
              }}
            >
              Avbryt publisering
            </Knapp>
          </li>
        </ul>
      </Modal>
    </>
  );
};

export default BulkPublishPanel;
