import { makeStyles } from "@material-ui/styles";
import { Knapp } from "nav-frontend-knapper";
import Modal from "nav-frontend-modal";
import { Undertittel } from "nav-frontend-typografi";
import React, { useState } from "react";
import { DryRunResult } from "../../types/migration";

const useModalStyles = makeStyles({
  modal: {
    width: "50rem",
    minHeight: "13rem",
    height: "auto",
    maxWidth: "90%",
    padding: "2rem 2.5rem",
  },
});

interface MigrateButtonProps {
  selectedFormPaths: string[];
  dryRunResults: DryRunResult[];
  onConfirm: () => Promise<any>;
}

const FormList = ({ heading, listElements }: { heading: string; listElements: DryRunResult[] }) => {
  return (
    <>
      <Undertittel className="margin-bottom-default">{heading}</Undertittel>
      <ul>
        {listElements.length > 0 ? (
          listElements.map(({ name, skjemanummer }) => (
            <li key={skjemanummer} className="list-inline-item">
              {name}
            </li>
          ))
        ) : (
          <li className="list-inline-item">N/A</li>
        )}
      </ul>
    </>
  );
};

const ConfirmMigration = ({ selectedFormPaths, dryRunResults, onConfirm }: MigrateButtonProps) => {
  const [isMigrationInProgress, setIsMigrationInProgress] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const styles = useModalStyles();
  return (
    <>
      <Modal
        className={styles.modal}
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        closeButton={true}
        contentLabel="Bekreft migrering"
        shouldCloseOnOverlayClick={false}
        ariaHideApp={false}
      >
        <FormList
          heading={"Skjemaer som vil bli migrert"}
          listElements={dryRunResults.filter(({ path }) => selectedFormPaths.includes(path))}
        />
        <FormList
          heading={"Skjemaer som ikke vil bli migrert"}
          listElements={dryRunResults
            .filter(({ changed }) => changed > 0)
            .filter(({ path }) => !selectedFormPaths.includes(path))}
        />
        <FormList
          heading={"Skjemaer som matcher søkekriteriene, men ikke er aktuelle for migrering"}
          listElements={dryRunResults.filter(({ changed }) => changed === 0)}
        />
        <ul className="list-inline">
          <li className="list-inline-item">
            <Knapp
              spinner={isMigrationInProgress}
              onClick={async () => {
                setIsMigrationInProgress(true);
                await onConfirm();
              }}
              htmlType="button"
            >
              Bekreft migrering
            </Knapp>
          </li>
          <li className="list-inline-item">
            <Knapp
              onClick={() => {
                setModalIsOpen(false);
              }}
            >
              Avbryt migrering
            </Knapp>
          </li>
        </ul>
      </Modal>
      <Knapp onClick={() => setModalIsOpen(true)} htmlType="button">
        Migrer
      </Knapp>
    </>
  );
};

export default ConfirmMigration;
