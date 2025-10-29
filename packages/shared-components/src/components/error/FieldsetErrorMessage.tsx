import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons';
import { BodyShort } from '@navikt/ds-react';
import { forwardRef } from 'react';
import makeStyles from '../../util/styles/jss/jss';

type Props = {
  errorMessage?: string;
  className?: string;
};

export const useFieldsetErrorMessageStyles = makeStyles({
  message: {
    display: 'flex',
    gap: 'var(--a-space-4)',
    color: 'var(--a-red-500)',
    marginTop: '.25rem',
    height: '1rem',
    '@media (max-width: 600px)': {
      alignItems: 'flex-start',
      height: 'auto',
      wordBreak: 'break-word',
      maxWidth: '75%',
    },
  },
  icon: {
    marginTop: '0.15em',
    flex: '0 0 auto',
    height: '100%',
  },
});

export const FieldsetErrorMessage = forwardRef<HTMLDivElement, Props>(({ errorMessage, className }, ref) => {
  const styles = useFieldsetErrorMessageStyles();
  return (
    errorMessage && (
      <div ref={ref} className={className}>
        <BodyShort weight="semibold" className={styles.message}>
          <ExclamationmarkTriangleFillIcon title="a11y-title" fontSize="1.2rem" className={styles.icon} />
          {errorMessage}
        </BodyShort>
      </div>
    )
  );
});
