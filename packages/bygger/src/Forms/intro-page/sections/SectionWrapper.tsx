import { Box } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { ReactNode } from 'react';

interface SectionWrapperProps {
  left?: ReactNode;
  right?: ReactNode;
  noBorderBottom?: boolean;
}

export function SectionWrapper({ left, right, noBorderBottom, ...rest }: SectionWrapperProps) {
  const useStyles = makeStyles({
    container: {
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      borderBottom: noBorderBottom ? undefined : '1px solid var(--a-surface-neutral)',
    },
    rightColumn: {
      borderLeft: '1px solid var(--a-surface-neutral-subtle) ',
      paddingLeft: '2rem',
    },
  });
  const styles = useStyles();
  return (
    <Box paddingBlock="10 8" className={styles.container} data-testid="section" {...rest}>
      <Box>{left}</Box>
      <Box className={styles.rightColumn}>{right}</Box>
    </Box>
  );
}
