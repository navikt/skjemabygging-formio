import { Box, Button, TextField } from '@navikt/ds-react';
import clsx from 'clsx';
import { forwardRef } from 'react';
import { useTextFieldStyles } from './styles';

type TextFieldComponentProps = {
  label: string;
  description?: string;
  placeholder?: string;
  defaultValue?: string;
  onChange: (value: string) => void;
  showDeleteButton?: boolean;
  onDelete?: () => void;
  hidden?: boolean;
  error?: string;
};

export const TextFieldComponent = forwardRef<HTMLInputElement, TextFieldComponentProps>(
  ({ label, description, defaultValue, hidden, onChange, onDelete, showDeleteButton, error }, ref) => {
    const styles = useTextFieldStyles();
    return (
      <Box className={styles.container}>
        <TextField
          defaultValue={defaultValue}
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
