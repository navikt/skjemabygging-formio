import { Box } from '@navikt/ds-react';
import { ReactNode } from 'react';
import { useSectionsWrapperStyles } from './styles';

interface SectionWrapperProps {
  left?: ReactNode;
  right?: ReactNode;
  noBorderBottom?: boolean;
}

export function SectionWrapper({ left, right, noBorderBottom = false, ...rest }: SectionWrapperProps) {
  const styles = useSectionsWrapperStyles(noBorderBottom)();
  return (
    <Box paddingBlock="space-12 space-8" className={styles.container} data-testid="section" {...rest}>
      <Box>{left}</Box>
      <Box className={styles.rightColumn}>{right}</Box>
    </Box>
  );
}
