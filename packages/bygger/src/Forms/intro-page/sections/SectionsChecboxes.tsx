import { PadlockLockedFillIcon } from '@navikt/aksel-icons';
import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import { Form, IntroPage, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import { UpdateFormFunction } from '../../../components/FormMetaDataEditor/utils/utils';
import SubmissionMethodToggle from '../components/SubmissionMethodToggle';
import { SectionWrapper } from './SectionWrapper';
import { useSectionsCheckboxesStyles } from './styles';

type Key = keyof IntroPage['sections'] | 'selfDeclaration' | 'introduction' | 'importantInformation';
type Section = {
  title: string;
  key: Key;
  isLocked?: boolean;
};

type SectionsCheckboxesProps = {
  form: Form;
  onChange: UpdateFormFunction;
  onToggleSubmissionMethod: (submissionMethod: SubmissionMethod) => void;
};

export function SectionsChecboxes({ form, onChange, onToggleSubmissionMethod }: SectionsCheckboxesProps) {
  const styles = useSectionsCheckboxesStyles();

  const sectionsOptions: Section[] = [
    { title: 'Velkomstbeskjed / introduksjon', key: 'introduction', isLocked: true },
    { title: 'Viktig informasjon', key: 'importantInformation' },
    { title: 'Beskrivelse av hva skjemaet kan brukes til', key: 'scope' },
    { title: 'Avklar hva skjemaet IKKE skal brukes til', key: 'outOfScope' },
    { title: 'Før du søker / sender / fyller ut', key: 'prerequisites', isLocked: false },
    { title: 'Vær klar over', key: 'beAwareOf', isLocked: true },
    { title: 'Informasjon vi henter (om deg)', key: 'dataDisclosure', isLocked: true },
    { title: 'Hvordan vi behandler personopplysninger', key: 'dataTreatment', isLocked: true },
    { title: 'Lagring underveis', key: 'dataStorage', isLocked: true },
    { title: 'Automatisk saksbehandling', key: 'automaticProcessing' },
    { title: 'Valgfri seksjon', key: 'optional' },
    { title: 'Erklæring om å gi riktige opplysninger', key: 'selfDeclaration', isLocked: true },
  ];

  const defaultKeys = [
    ...sectionsOptions.filter((section) => section.isLocked).map((section) => section.key),
    ...(form?.introPage?.importantInformation !== undefined ? ['importantInformation'] : []),
    ...Object.keys(form?.introPage?.sections || {}).filter((key) => form?.introPage?.sections?.[key] !== undefined),
  ];

  const handleCheckboxChange = (key: Key, checked: boolean) => {
    const isImportantInfo = key === 'importantInformation';
    const isLocked = sectionsOptions.find((section) => section.key === key)?.isLocked;

    const updatedIntroPage = {
      enabled: form.introPage?.enabled ?? false,
      introduction: form.introPage?.introduction ?? '',
      selfDeclaration: form.introPage?.selfDeclaration ?? '',
      importantInformation: form.introPage?.importantInformation,
      sections: {
        ...(form.introPage?.sections ?? {}),
      },
    };

    if (checked) {
      if (isImportantInfo) {
        updatedIntroPage.importantInformation = updatedIntroPage.importantInformation ?? {};
      } else {
        updatedIntroPage.sections[key] = updatedIntroPage.sections[key] ?? {};
      }
    } else if (!isLocked) {
      if (isImportantInfo) {
        updatedIntroPage.importantInformation = undefined;
      } else {
        delete updatedIntroPage.sections[key];
      }
    }

    onChange({
      ...form,
      introPage: updatedIntroPage as IntroPage,
    });
  };

  return (
    <SectionWrapper
      left={
        <CheckboxGroup
          className={styles.checkboxGroup}
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
      right={<SubmissionMethodToggle onToggle={onToggleSubmissionMethod} />}
    />
  );
}
