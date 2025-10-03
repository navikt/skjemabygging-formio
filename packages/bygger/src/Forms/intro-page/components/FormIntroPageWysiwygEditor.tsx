import { BodyLong, BodyShort, Box, Button } from '@navikt/ds-react';
import clsx from 'clsx';
import { forwardRef } from 'react';
import WysiwygEditor from '../../../components/wysiwyg/WysiwygEditor';
import { useTextFieldStyles } from './styles';

type TexareaFieldProps = {
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

export const FormIntroPageWysiwygEditor = forwardRef<HTMLDivElement, TexareaFieldProps>(
  ({ label, description, defaultValue, hidden, onChange, onDelete, showDeleteButton, error }, ref) => {
    const styles = useTextFieldStyles();
    return (
      <Box className={styles.container}>
        <div
          className={clsx({
            [styles.textField]: !showDeleteButton,
            [styles.textFieldWithDeleteButton]: showDeleteButton,
            [styles.hidden]: hidden,
          })}
        >
          <BodyShort weight="semibold">{label}</BodyShort>
          <BodyLong size="medium" textColor="subtle">
            {description}
          </BodyLong>
          <WysiwygEditor defaultValue={defaultValue} onBlur={onChange} ref={ref} error={error} />
        </div>
        {showDeleteButton && (
          <Button variant="tertiary" className={styles.deleteButton} onClick={onDelete}>
            Slett
          </Button>
        )}
      </Box>
    );
  },
);
