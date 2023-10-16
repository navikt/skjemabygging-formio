import { Button, Heading } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { Dispatch } from 'react';
import { Action } from './MigrationOptionsForm.reducer';

const getStyles = makeStyles({
  form: {
    marginBottom: '3rem',
  },
});

export type TestId = 'search-filters' | 'dependency-filters' | 'edit-options';
interface MigrationOptionsFormProps {
  title: string;
  addRowText: string;
  dispatch: Dispatch<Action>;
  testId: TestId;
  children: JSX.Element;
}

const MigrationOptionsForm = ({ addRowText, title, dispatch, testId, children }: MigrationOptionsFormProps) => {
  const styles = getStyles();
  return (
    <div data-testid={testId}>
      <Heading level="2" size="large">
        {title}
      </Heading>
      <div className={styles.form}>
        {children}
        <div>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              dispatch({ type: 'add' });
            }}
            data-testid={'add-button'}
          >
            {addRowText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MigrationOptionsForm;
