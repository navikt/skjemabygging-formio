import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons';
import { BodyShort } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { forwardRef } from 'react';

type Props = {
  errorMessage?: string;
};

const useStyles = makeStyles({
  message: {
    display: 'flex',
    gap: 'var(--a-space-4)',
    color: 'var(--a-red-500)',
    marginTop: '.25rem',
    height: '1rem',
  },
  icon: {
    marginTop: '0.15em',
    flex: '0 0 auto',
    height: '100%',
  },
});

export const FieldsetErrorMessage = forwardRef<HTMLDivElement, Props>(({ errorMessage }, ref) => {
  const styles = useStyles();
  return (
    errorMessage && (
      <div ref={ref} tabIndex={-1}>
        <BodyShort weight="semibold" className={styles.message}>
          <ExclamationmarkTriangleFillIcon title="a11y-title" fontSize="1.2rem" className={styles.icon} />
          {errorMessage}
        </BodyShort>
      </div>
    )
  );
});
