import { makeStyles } from "@material-ui/styles";
import { Button } from "@navikt/ds-react";
import { Modal } from "@navikt/skjemadigitalisering-shared-components";
import { useState } from "react";
import { FormMigrationLogData } from "../../../types/migration";
import FormList from "./FormList";

const useStyles = makeStyles({
  button: {
    width: "max-content",
  },
});

interface ConfirmMigrationProps {
  selectedFormPaths: string[];
  dryRunResults: FormMigrationLogData[];
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
            <Button
              variant="primary"
              loading={isMigrationInProgress}
              onClick={async () => {
                setIsMigrationInProgress(true);
                await onConfirm();
              }}
            >
              Bekreft migrering
            </Button>
          </li>
          <li className="list-inline-item">
            <Button
              variant="secondary"
              type="button"
              onClick={() => {
                setModalIsOpen(false);
              }}
            >
              Avbryt migrering
            </Button>
          </li>
        </ul>
      </Modal>
      <Button variant="secondary" className={styles.button} onClick={() => setModalIsOpen(true)} type="button">
        Migrer
      </Button>
    </>
  );
};

export default ConfirmMigration;
