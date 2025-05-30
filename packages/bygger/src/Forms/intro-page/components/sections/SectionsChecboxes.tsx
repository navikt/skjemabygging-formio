import { PadlockLockedFillIcon } from '@navikt/aksel-icons';
import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { Form, IntroPage } from '@navikt/skjemadigitalisering-shared-domain';
import { UpdateFormFunction } from '../../../../components/FormMetaDataEditor/utils/utils';
import { SectionWrapper } from './SectionWrapper';

const useStyles = makeStyles({
  padlockIcon: {
    verticalAlign: 'sub',
  },
});

type Key = keyof IntroPage['sections'] | 'selfDeclaration' | 'introduction';
type Section = {
  title: string;
  key: Key;
  isLocked?: boolean;
};

type SectionsCheckboxesProps = {
  form: Form;
  onChange: UpdateFormFunction;
};

export function SectionsChecboxes({ form, onChange }: SectionsCheckboxesProps) {
  const styles = useStyles();

  const sectionsOptions: Section[] = [
    { title: 'Velkomstbeskjed / introduksjon', key: 'introduction', isLocked: true },
    { title: 'Viktig informasjon', key: 'importantInformation' },
    { title: 'Beskrivelse av hva skjemaet kan brukes til', key: 'scope' },
    { title: 'Avklar hva skjemaet IKKE skal brukes til', key: 'outOfScope' },
    { title: 'Før du søker / sender / fyller ut', key: 'prerequisites', isLocked: true },
    { title: 'Informasjon vi henter (om deg)', key: 'dataDisclosure' },
    { title: 'Hvordan vi behandler personopplysninger', key: 'dataTreatment', isLocked: true },
    { title: 'Lagring underveis', key: 'dataStorage', isLocked: true },
    { title: 'Automatisk saksbehandling', key: 'automaticProcessing' },
    { title: 'Valgfri seksjon', key: 'optional' },
    { title: 'Erklæring om å gi riktige opplysninger', key: 'selfDeclaration', isLocked: true },
  ];

  const defaultKeys = [
    ...sectionsOptions.filter((section) => section.isLocked).map((section) => section.key),
    ...Object.keys(form?.introPage?.sections || {}).filter((key) => form?.introPage?.sections?.[key] !== undefined),
  ];

  const handleCheckboxChange = (key: Key, checked: boolean) => {
    const updatedSections = { ...form?.introPage?.sections };

    if (checked) {
      updatedSections[key] = updatedSections[key] || {};
    } else {
      if (!sectionsOptions.find((section) => section.key === key)?.isLocked) {
        delete updatedSections[key];
      }
    }

    onChange({
      ...form,
      introPage: {
        ...form?.introPage,
        sections: updatedSections,
      },
    });
  };

  return (
    <SectionWrapper
      left={
        <CheckboxGroup
          legend="Velg hvilke seksjoner som skal vises på introsiden"
          name="sections"
          defaultValue={defaultKeys}
        >
          {sectionsOptions.map(({ title, key, isLocked }) => (
            <Checkbox
              value={key}
              key={key}
              readOnly={isLocked}
              onChange={(e) => handleCheckboxChange(key, e.target.checked)}
            >
              <span>
                {isLocked && <PadlockLockedFillIcon className={styles.padlockIcon} />}
                {title}
              </span>
            </Checkbox>
          ))}
        </CheckboxGroup>
      }
      right={<div>Preview kommer</div>}
    />
  );
}
