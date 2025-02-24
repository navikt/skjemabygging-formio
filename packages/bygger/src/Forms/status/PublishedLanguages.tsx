import { Label } from '@navikt/ds-react';
import { Form } from '@navikt/skjemadigitalisering-shared-domain';
import { useStatusStyles } from './styles';

export const allLanguagesInNorwegian = {
  nb: 'Norsk bokmål',
  nn: 'Norsk nynorsk',
  en: 'Engelsk',
};

type Props = Pick<Form, 'publishedLanguages'>;

const PublishedLanguages = ({ publishedLanguages }: Props) => {
  const styles = useStatusStyles({});
  if (publishedLanguages) {
    const sortedLanguageCodes = [...publishedLanguages].sort();
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
