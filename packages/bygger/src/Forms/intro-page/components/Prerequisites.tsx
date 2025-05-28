import { PlusIcon } from '@navikt/aksel-icons';
import { Box, Button, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { useState } from 'react';
import { SectionWrapper } from './SectionWrapper';
import { TexareaField } from './TexareaField';

const useStyles = makeStyles({
  addButton: {
    borderRadius: 'var(--a-border-radius-large)',
    margin: 'var(--a-space-12) var(--a-space-16) var(--a-space-12) 0',
  },
});

export function Prerequisites() {
  const [showIngress, setShowIngress] = useState(false);
  const styles = useStyles();

  return (
    <SectionWrapper
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Informasjon om utfylling av skjemaet
          </Heading>
          <RadioGroup legend="Velg overskrift">
            <Radio value="scope1">Før du søker</Radio>
            <Radio value="scope2">Før du svarer</Radio>
            <Radio value="scope3">Før du fyller ut</Radio>
          </RadioGroup>
          <Box>
            <Button
              icon={<PlusIcon />}
              variant="secondary"
              size="small"
              className={styles.addButton}
              onClick={() => setShowIngress(!showIngress)}
            >
              Legg til ingress
            </Button>
            <TexareaField label="Ingress" onChange={() => setShowIngress(true)} hidden={!showIngress} />
          </Box>
          <Button icon={<PlusIcon />} variant="tertiary" size="small" className={styles.addButton}>
            Legg til kulepunkt
          </Button>
          <TexareaField label="Kulepunkt" onChange={() => setShowIngress(true)} hidden={!showIngress} />
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}
