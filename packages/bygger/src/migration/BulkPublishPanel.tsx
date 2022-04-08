import { makeStyles } from "@material-ui/styles";
import Formiojs from "formiojs/Formio";
import { Knapp } from "nav-frontend-knapper";
import Modal from "nav-frontend-modal";
import Panel from "nav-frontend-paneler";
import { Checkbox } from "nav-frontend-skjema";
import { Undertekst, Undertittel } from "nav-frontend-typografi";
import React, { useReducer, useState } from "react";
import { bulkPublish } from "./api";
import FormList from "./components/FormList";

function reducer(state, action) {
  switch (action.type) {
    case "check":
      return { ...state, [action.payload]: true };
    case "uncheck":
      return { ...state, [action.payload]: false };
    default:
      throw new Error();
  }
}

function init(forms) {
  return forms.reduce((acc, form) => ({ ...acc, [form.path]: true }), {});
}

const useStyles = makeStyles({
  noBullets: {
    listStyleType: "none",
  },
  listElement: {
    marginBottom: "1rem",
  },
  modal: {
    width: "50rem",
    minHeight: "13rem",
    height: "auto",
    maxWidth: "90%",
    padding: "2rem 2.5rem",
  },
});

const BulkPublishPanel = ({ forms }) => {
  const styles = useStyles();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [state, dispatch] = useReducer(reducer, forms, init);

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
        <Undertittel tag="h3">Disse skjemaene ble migrert, og må publiseres manuelt</Undertittel>
        <Undertekst>
          Pass på å kopiere denne listen før du laster siden på nytt eller utfører en ny migrering
        </Undertekst>
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
                  checked={state[form.path]}
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
      <Modal
        className={styles.modal}
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        closeButton={true}
        contentLabel="Bekreft publisering"
        shouldCloseOnOverlayClick={false}
        ariaHideApp={false}
      >
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
