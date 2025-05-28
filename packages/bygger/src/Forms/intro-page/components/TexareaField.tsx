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
  deleteButton: {
    borderRadius: 'var(--a-border-radius-large)',
    margin: 'var(--a-space-12) var(--a-space-16) var(--a-space-12) 0',
  },
  textField: {
    padding: 'var(--a-space-12) var(--a-space-32) 0 0',
  },
  hidden: {
    display: 'none',
  },
});

export function TexareaField({
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
    <Box>
      {showDeleteButton && (
        <Button variant="tertiary" className={styles.deleteButton} onClick={onDelete}>
          Slett
        </Button>
      )}
      <Textarea
        {...rest}
        className={clsx(styles.textField, { [styles.hidden]: hidden })}
        label={label}
        description={description}
        resize="vertical"
        onChange={() => onChange}
      />
    </Box>
  );
}
