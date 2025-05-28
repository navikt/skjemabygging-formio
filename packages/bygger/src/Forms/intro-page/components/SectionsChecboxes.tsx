import { PadlockLockedFillIcon } from '@navikt/aksel-icons';
import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { SectionWrapper } from './SectionWrapper';

const useStyles = makeStyles({
  padlockIcon: {
    verticalAlign: 'sub',
  },
});

type Section = {
  title: string;
  isLocked?: boolean;
  checked?: boolean;
};

export function SectionsChecboxes() {
  const styles = useStyles();

  const sectionsOptions: Section[] = [
    { title: 'Velkomstbeskjed / introduksjon', isLocked: true, checked: true },
    { title: 'Viktig informasjon', isLocked: false, checked: false },
    { title: 'Beskrivelse av hva skjemaet kan brukes til', isLocked: false, checked: false },
    { title: 'Avklar hva skjemaet IKKE skal brukes til', isLocked: false, checked: false },
    { title: 'Før du søker / sender / fyller ut', isLocked: true, checked: true },
    { title: 'Informasjon vi henter (om deg)', isLocked: false, checked: false },
    { title: 'Hvordan vi behandler personopplysninger', isLocked: true, checked: true },
    { title: 'Lagring underveis', isLocked: true, checked: true },
    { title: 'Automatisk saksbehandling', isLocked: false, checked: false },
    { title: 'Valgfri seksjon', isLocked: false, checked: false },
    { title: 'Erklæring om å gi riktige opplysninger', isLocked: true, checked: true },
  ];
  return (
    <SectionWrapper
      left={
        <CheckboxGroup legend="Velg hvilke seksjoner som skal vises på introsiden" name="sections">
          {sectionsOptions.map(({ title, isLocked, checked }: Section) => (
            <Checkbox value={title} key={title} readOnly={isLocked} checked={checked}>
              <span>
                {isLocked && <PadlockLockedFillIcon className={styles.padlockIcon} />}
                {title}
              </span>
            </Checkbox>
          ))}
        </CheckboxGroup>
      }
      right={<div>Preview kommer</div>}
    ></SectionWrapper>
  );
}
