import { makeStyles } from "@material-ui/styles";
import { Knapp } from "nav-frontend-knapper";
import Modal from "nav-frontend-modal";
import React, { useState } from "react";
import { DryRunResult } from "../../types/migration";
import FormList from "./components/FormList";

const useModalStyles = makeStyles({
  modal: {
    width: "50rem",
    minHeight: "13rem",
    height: "auto",
    maxWidth: "90%",
    padding: "2rem 2.5rem",
  },
});

interface ConfirmMigrationProps {
  selectedFormPaths: string[];
  dryRunResults: DryRunResult[];
  onConfirm: () => Promise<unknown>;
}

const ConfirmMigration = ({ selectedFormPaths, dryRunResults, onConfirm }: ConfirmMigrationProps) => {
  const [isMigrationInProgress, setIsMigrationInProgress] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const styles = useModalStyles();

  const willBeMigrated = dryRunResults.filter(({ path }) => selectedFormPaths.includes(path));
  const willNotBeMigrated = dryRunResults
    .filter(({ changed }) => changed > 0)
    .filter(({ path }) => !selectedFormPaths.includes(path));
  const ineligibleForMigration = dryRunResults.filter(({ changed }) => changed === 0);

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
        <FormList heading={"Skjemaer som vil bli migrert"} listElements={willBeMigrated} />
        <FormList heading={"Skjemaer som ikke vil bli migrert"} listElements={willNotBeMigrated} />
        <FormList
          heading={"Skjemaer som matcher søkekriteriene, men ikke er aktuelle for migrering"}
          listElements={ineligibleForMigration}
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
