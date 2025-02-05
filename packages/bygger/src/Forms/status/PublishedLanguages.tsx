import { Label } from '@navikt/ds-react';
import { languagesInNorwegian } from '../../context/i18n';
import { useStatusStyles } from './styles';
import { FormStatusProperties } from './types';

const langCodeBokmal = 'nb-NO';
export const allLanguagesInNorwegian = {
  ...languagesInNorwegian,
  [langCodeBokmal]: 'Norsk bokmål',
};

interface Props {
  publishProperties: FormStatusProperties;
}

const PublishedLanguages = ({ publishProperties }: Props) => {
  const styles = useStatusStyles({});
  if (publishProperties.publishedAt && publishProperties.publishedLanguages) {
    const sortedLanguageCodes = [...publishProperties.publishedLanguages, langCodeBokmal].sort();
    return (
      <div className={styles.panelItem}>
        <Label>Publiserte språk:</Label>
        {sortedLanguageCodes.map((langCode) => {
          return (
            <p key={langCode} className={styles.rowText}>
              {allLanguagesInNorwegian[langCode]}
            </p>
          );
        })}
      </div>
    );
  }
  return null;
};

export default PublishedLanguages;
