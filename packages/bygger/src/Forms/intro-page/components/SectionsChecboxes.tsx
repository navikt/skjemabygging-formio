import { PadlockLockedFillIcon } from '@navikt/aksel-icons';
import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { SectionWrapper } from './SectionWrapper';

const useStyles = makeStyles({
  padlockIcon: {
    verticalAlign: 'middle',
  },
});

export function SectionsChecboxes() {
  const styles = useStyles();

  const sectionsOptions = [
    'Velkomstbeskjed/introduksjon',
    'Viktig informasjon',
    'Om søknaden',
    'Om behandlingen',
    'Om lagring',
    'Om automatisk behandling',
    'Om personopplysninger',
    'Om samtykke',
  ];
  return (
    <SectionWrapper>
      <CheckboxGroup legend="Velg hvilke seksjoner som skal vises på introsiden" name="sections">
        {sectionsOptions.map((section: string) => (
          <Checkbox value={section} key={section} readOnly={section === 'Velkomstbeskjed/introduksjon'}>
            <span>
              {section === 'Velkomstbeskjed/introduksjon' && <PadlockLockedFillIcon className={styles.padlockIcon} />}{' '}
              {section}
            </span>
          </Checkbox>
        ))}
      </CheckboxGroup>
    </SectionWrapper>
  );
}
