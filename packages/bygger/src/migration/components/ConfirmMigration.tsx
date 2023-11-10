import { Button } from '@navikt/ds-react';
import { ConfirmationModal, makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { useState } from 'react';
import { FormMigrationLogData } from '../../../types/migration';
import FormList from './FormList';

const useStyles = makeStyles({
  button: {
    width: 'max-content',
  },
});

interface ConfirmMigrationProps {
  selectedFormPaths: string[];
  dryRunResults: FormMigrationLogData[];
  onConfirm: () => Promise<void> | void;
}

const ConfirmMigration = ({ selectedFormPaths, dryRunResults, onConfirm }: ConfirmMigrationProps) => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const styles = useStyles();

  const willBeMigrated = dryRunResults.filter(({ path }) => selectedFormPaths.includes(path));
  const willNotBeMigrated = dryRunResults
    .filter(({ changed }) => changed > 0)
    .filter(({ path }) => !selectedFormPaths.includes(path));
  const ineligibleForMigration = dryRunResults.filter(({ changed }) => changed === 0);

  return (
    <>
      <ConfirmationModal
        open={modalIsOpen}
        onClose={() => setModalIsOpen(false)}
        onConfirm={onConfirm}
        texts={{
          title: 'Bekreft publisering',
          confirm: 'Bekreft migrering',
          cancel: 'Avbryt migrering',
        }}
      >
        <FormList heading={'Skjemaer som vil bli migrert'} listElements={willBeMigrated} />
        <FormList heading={'Skjemaer som ikke vil bli migrert'} listElements={willNotBeMigrated} />
        <FormList
          heading={'Skjemaer som matcher søkekriteriene, men ikke er aktuelle for migrering'}
          listElements={ineligibleForMigration}
        />
      </ConfirmationModal>
      <Button variant="secondary" className={styles.button} onClick={() => setModalIsOpen(true)} type="button">
        Migrer
      </Button>
    </>
  );
};

export default ConfirmMigration;
