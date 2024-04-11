import { BodyShort, Heading } from '@navikt/ds-react';
import { makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { useEffect, useState } from 'react';
import { languagesInNorwegian, useI18nDispatch } from '../context/i18n';
import FormItem from './FormItem';
import ObsoleteTranslationsPanel from './ObsoleteTranslationsPanel';

const useStyles = makeStyles({
  root: {
    width: '80ch',
    margin: '0 auto',
  },
});

const TranslationsToRemove = ({ translations, languageCode }) => {
  const dispatch = useI18nDispatch();
  const onDelete = (key) => {
    dispatch({ type: 'remove', payload: { lang: languageCode, key } });
  };
  const obsoleteTranslations = translations.map(([originalText, translated]) => ({
    id: originalText,
    originalText,
    translatedText: translated.value,
  }));
  return (
    <ObsoleteTranslationsPanel
      translations={obsoleteTranslations}
      onDelete={(t) => onDelete(t.originalText)}
      className="mb"
    />
  );
};

const TranslationsFormPage = ({ skjemanummer, translations, title, flattenedComponents, languageCode }) => {
  const styles = useStyles();
  const [currentTranslation, setCurrentTranslation] = useState();
  const [unusedTranslations, setUnusedTranslations] = useState([]);

  useEffect(
    () => setCurrentTranslation((translations[languageCode] && translations[languageCode].translations) || {}),
    [translations, languageCode],
  );

  useEffect(() => {
    const unusedTranslationsAsEntries = Object.entries(
      (translations[languageCode] && translations[languageCode].translations) || {},
    )
      .filter(([_, value]) => value.scope === 'local')
      .filter(([key, _]) => !flattenedComponents.some(({ text }) => text === key));
    setUnusedTranslations(unusedTranslationsAsEntries);
  }, [translations, flattenedComponents, languageCode]);

  if (!currentTranslation) {
    return <></>;
  }

  return (
    <div className={styles.root}>
      <Heading level="1" size="xlarge">
        {title}
      </Heading>
      <BodyShort className="mb">{skjemanummer}</BodyShort>
      {unusedTranslations.length > 0 && (
        <TranslationsToRemove translations={unusedTranslations} languageCode={languageCode} />
      )}
      <Heading level="2" size="large">
        {`Oversettelser${languageCode ? ' på ' + languagesInNorwegian[languageCode] : ''}`}
      </Heading>
      <form>
        {flattenedComponents.map((comp) => {
          const { text, type } = comp;
          return (
            <FormItem
              translations={currentTranslation}
              text={text}
              type={type}
              key={`translation-${skjemanummer}-${text}-${languageCode}`}
              languageCode={languageCode}
            />
          );
        })}
      </form>
    </div>
  );
};
export default TranslationsFormPage;
