import { ExclamationmarkTriangleFillIcon } from '@navikt/aksel-icons';
import { BodyShort } from '@navikt/ds-react';
import { forwardRef } from 'react';
import { useFieldsetErrorMessageStyles } from './styles';

type Props = {
  errorMessage?: string;
};

export const FieldsetErrorMessage = forwardRef<HTMLDivElement, Props>(({ errorMessage }, ref) => {
  const styles = useFieldsetErrorMessageStyles();
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
