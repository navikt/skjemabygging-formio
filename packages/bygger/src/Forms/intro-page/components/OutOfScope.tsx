import { PlusIcon } from '@navikt/aksel-icons';
import { Box, Button, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { useState } from 'react';
import { SectionWrapper } from './SectionWrapper';
import { TexareaField } from './TexareaField';

const useStyles = makeStyles({
  addButton: {
    borderRadius: 'var(--a-border-radius-large)',
    margin: 'var(--a-space-16) var(--a-space-16) var(--a-space-12) 0',
  },
});

export function OutOfScope() {
  const styles = useStyles();

  const [showIngress, setShowIngress] = useState(false);
  const [showBodyText, setShowBodyText] = useState(false);

  return (
    <SectionWrapper
      left={
        <Box>
          <Heading level="3" size="small" spacing>
            Avklar hva skjemaet IKKE skal brukes til
          </Heading>
          <RadioGroup legend="Velg overskrift">
            <Radio value="scope1"> Her kan du søke om</Radio>
            <Radio value="scope2">Her kan du melde om</Radio>
            <Radio value="scope3">Her kan du</Radio>
          </RadioGroup>
          <Button
            icon={<PlusIcon />}
            variant="secondary"
            size="small"
            className={styles.addButton}
            onClick={() => setShowIngress(!showIngress)}
          >
            Legg til ingress
          </Button>
          <TexareaField label="Ingress" onChange={() => setShowIngress(!showIngress)} hidden={!showIngress} />
          <Button
            icon={<PlusIcon />}
            variant="secondary"
            size="small"
            className={styles.addButton}
            onClick={() => setShowBodyText(!showBodyText)}
          >
            Legg til punktliste
          </Button>
          <TexareaField label="Kulepunkt" onChange={() => setShowIngress(!showIngress)} hidden={!showBodyText} />
        </Box>
      }
      right={<p>Preview kommer</p>}
    />
  );
}
