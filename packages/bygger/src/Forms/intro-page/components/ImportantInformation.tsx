import { PlusIcon } from '@navikt/aksel-icons';

import { Box, Button, Heading } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { useState } from 'react';
import { SectionWrapper } from './SectionWrapper';
import { TexareaField } from './TexareaField';

const useStyles = makeStyles({
  addButton: {
    borderRadius: 'var(--a-border-radius-large)',
    margin: 'var(--a-space-12) 0 var(--a-space-12) 0',
  },
});

export function ImportantInformation() {
  const [isActive, setIsActive] = useState(false);
  const styles = useStyles();
  return (
    <SectionWrapper
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Viktig informasjon
          </Heading>
          <Button
            icon={<PlusIcon />}
            variant="secondary"
            size="small"
            className={styles.addButton}
            onClick={() => setIsActive(!isActive)}
          >
            Legg til overskrift
          </Button>
          <TexareaField label="Overskrift" onChange={() => setIsActive(!setIsActive)} hidden={!isActive} />
          <TexareaField label="Brødtekst" onChange={() => setIsActive(!setIsActive)} />
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}
