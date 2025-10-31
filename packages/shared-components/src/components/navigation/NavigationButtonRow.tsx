import clsx from 'clsx';
import { ReactNode } from 'react';
import makeStyles from '../../util/styles/jss/jss';
import { FieldsetErrorMessage } from '../error/FieldsetErrorMessage';

const useStyles = makeStyles({
  error: {
    marginBottom: '1.5rem',
  },
});
export function NavigationButtonRow({
  nextButton,
  previousButton,
  saveButton,
  cancelButton,
  errorMessage,
  floatLeft = false,
}: {
  nextButton?: ReactNode;
  previousButton?: ReactNode;
  saveButton?: ReactNode;
  cancelButton?: ReactNode;
  errorMessage?: string;
  floatLeft?: boolean;
}) {
  const styles = useStyles();
  // TODO finn en god løsning på sentrering vs align left gjennom skjemaet
  // TODO håndtere rekkefølge på tab navigasjon når høyre knapp er secondary på oppsummeringssiden
  return (
    <nav>
      <div
        className={clsx('button-row', {
          'button-row__center': !floatLeft,
        })}
      >
        {nextButton}
        {previousButton}
      </div>
      {errorMessage && <FieldsetErrorMessage errorMessage={errorMessage} className={styles.error} />}

      <div
        className={clsx('button-row', {
          'button-row__center': !floatLeft,
        })}
      >
        {cancelButton}
        {saveButton}
      </div>
    </nav>
  );
}
