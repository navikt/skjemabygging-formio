import { Box, Button, Textarea } from '@navikt/ds-react';
import clsx from 'clsx';
import { forwardRef } from 'react';
import { useTextFieldStyles } from './styles';

type TexareaFieldProps = {
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

export const TextareaField = forwardRef<HTMLTextAreaElement, TexareaFieldProps>(
  ({ label, description, value, hidden, onChange, onDelete, showDeleteButton, error }, ref) => {
    const styles = useTextFieldStyles();
    return (
      <Box className={styles.container}>
        <Textarea
          ref={ref}
          error={error}
          className={clsx({
            [styles.textField]: !showDeleteButton,
            [styles.textFieldWithDeleteButton]: showDeleteButton,
            [styles.hidden]: hidden,
          })}
          label={label}
          value={value}
          description={description}
          resize="vertical"
          onChange={(e) => onChange(e.target.value)}
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
