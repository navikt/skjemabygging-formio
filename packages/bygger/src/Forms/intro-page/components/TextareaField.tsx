import { Box, Button, Textarea } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import clsx from 'clsx';

type TexareaFieldProps = {
  label: string;
  description?: string;
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  showDeleteButton?: boolean;
  onDelete?: () => void;
  hidden?: boolean;
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

export function TextareaField({
  label,
  description,
  placeholder,
  value,
  hidden,
  onChange,
  onDelete,
  showDeleteButton,
  ...rest
}: TexareaFieldProps) {
  const styles = useStyles();
  return (
    <Box className={styles.container}>
      <Textarea
        {...rest}
        className={clsx({
          [styles.textField]: !showDeleteButton,
          [styles.textFieldWithDeleteButton]: showDeleteButton,
          [styles.hidden]: hidden,
        })}
        label={label}
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
}
