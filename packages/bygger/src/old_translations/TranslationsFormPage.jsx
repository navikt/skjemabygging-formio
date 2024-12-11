import { Heading } from '@navikt/ds-react';
import { useEffect, useState } from 'react';
import { languagesInNorwegian, useI18nDispatch } from '../context/i18n';
import FormItem from './FormItem';
import ObsoleteTranslationsPanel from './ObsoleteTranslationsPanel';

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

const TranslationsFormPage = ({ skjemanummer, translations, flattenedComponents, languageCode }) => {
  const [currentTranslation, setCurrentTranslation] = useState({});
  const [unusedTranslations, setUnusedTranslations] = useState([]);

  useEffect(() => {
    if (translations && languageCode) {
      setCurrentTranslation({ translations: translations?.[languageCode]?.translations ?? {}, languageCode });
    }
  }, [translations, languageCode]);

  useEffect(() => {
    const unusedTranslationsAsEntries = Object.entries(
      (translations[languageCode] && translations[languageCode].translations) || {},
    )
      .filter(([_, value]) => value.scope === 'local')
      .filter(([key, _]) => !flattenedComponents.some(({ text }) => text === key));
    setUnusedTranslations(unusedTranslationsAsEntries);
  }, [translations, flattenedComponents, languageCode]);

  if (!currentTranslation.translations) {
    return <></>;
  }

  return (
    <div>
      {unusedTranslations.length > 0 && (
        <TranslationsToRemove translations={unusedTranslations} languageCode={languageCode} />
      )}
      <Heading level="2" size="medium">
        {`Oversettelser${languageCode ? ' på ' + languagesInNorwegian[languageCode] : ''}`}
      </Heading>
      <form>
        {flattenedComponents.map((comp) => {
          const { text, type } = comp;
          return (
            <FormItem
              translations={currentTranslation.translations}
              text={text}
              type={type}
              key={`translation-${skjemanummer}-${text}`}
              languageCode={currentTranslation.languageCode}
            />
          );
        })}
      </form>
    </div>
  );
};
export default TranslationsFormPage;
