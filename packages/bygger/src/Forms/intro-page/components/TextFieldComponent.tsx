import { Box, Button, TextField } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import clsx from 'clsx';
import { forwardRef } from 'react';

type TextFieldComponentProps = {
  label: string;
  description?: string;
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  showDeleteButton?: boolean;
  onDelete?: () => void;
  hidden?: boolean;
  error?: string;
};

const useStyles = makeStyles({
  container: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  deleteButton: {
    borderRadius: 'var(--a-border-radius-large)',
    margin: '0 var(--a-space-12) 0 0',
  },
  textField: {
    padding: 'var(--a-space-12) var(--a-space-32) 0 0',
    width: '100%',
  },
  textFieldWithDeleteButton: {
    padding: 'var(--a-space-12) var(--a-space-12) 0 0',
    width: '100%',
  },
  hidden: {
    display: 'none',
  },
});

export const TextFieldComponent = forwardRef<HTMLInputElement, TextFieldComponentProps>(
  ({ label, description, value, hidden, onChange, onDelete, showDeleteButton, error }, ref) => {
    const styles = useStyles();
    return (
      <Box className={styles.container}>
        <TextField
          value={value}
          ref={ref}
          className={clsx({
            [styles.textField]: !showDeleteButton,
            [styles.textFieldWithDeleteButton]: showDeleteButton,
            [styles.hidden]: hidden,
          })}
          label={label}
          description={description}
          onChange={(e) => onChange(e.target.value)}
          error={error}
        />
        {showDeleteButton && (
          <Button variant="tertiary" className={styles.deleteButton} onClick={onDelete}>
            Slett
          </Button>
        )}
      </Box>
    );
  },
);
