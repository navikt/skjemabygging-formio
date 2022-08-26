import { makeStyles } from "@material-ui/styles";
import { Modal } from "@navikt/skjemadigitalisering-shared-components";
import { Knapp } from "nav-frontend-knapper";
import React, { useState } from "react";
import { DryRunResult } from "../../../types/migration";
import FormList from "./FormList";

const useStyles = makeStyles({
  button: {
    width: "max-content",
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
  const styles = useStyles();

  const willBeMigrated = dryRunResults.filter(({ path }) => selectedFormPaths.includes(path));
  const willNotBeMigrated = dryRunResults
    .filter(({ changed }) => changed > 0)
    .filter(({ path }) => !selectedFormPaths.includes(path));
  const ineligibleForMigration = dryRunResults.filter(({ changed }) => changed === 0);

  return (
    <>
      <Modal open={modalIsOpen} onClose={() => setModalIsOpen(false)} ariaLabel="Bekreft migrering">
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
      <Knapp className={styles.button} onClick={() => setModalIsOpen(true)} htmlType="button">
        Migrer
      </Knapp>
    </>
  );
};

export default ConfirmMigration;
