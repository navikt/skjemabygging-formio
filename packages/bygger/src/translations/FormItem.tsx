import { HtmlAsJsonElement, HtmlAsJsonTextElement } from '@navikt/skjemadigitalisering-shared-components';
import { ScopedTranslationMap } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { useI18nDispatch } from '../context/i18n';
import TranslationFormHtmlItem from './TranslationFormHtmlItem';
import TranslationTextInput from './TranslationTextInput';

interface Props {
  translations: ScopedTranslationMap;
  text: string;
  htmlElementAsJson?: HtmlAsJsonElement | HtmlAsJsonTextElement;
  type: string;
  languageCode: string;
}

const FormItem = ({ translations, text, htmlElementAsJson, type, languageCode }: Props) => {
  const [showGlobalTranslation, setShowGlobalTranslation] = useState(false);
  const [hasGlobalTranslation, setHasGlobalTranslation] = useState(false);
  const [currentTranslation, setCurrentTranslation] = useState<string>();
  const [tempGlobalTranslation, setTempGlobalTranslation] = useState('');

  const dispatch = useI18nDispatch();

  useEffect(() => {
    if (translations && translations[text]) {
      if (translations[text].scope === 'global') {
        setHasGlobalTranslation(true);
        setShowGlobalTranslation(true);
        setTempGlobalTranslation(translations[text].value ?? '');
      }
      setCurrentTranslation(translations[text].value ?? '');
    } else {
      setCurrentTranslation('');
      setHasGlobalTranslation(false);
      setShowGlobalTranslation(false);
    }
  }, [translations, text]);

  const updateTranslations = (targetValue) => {
    console.log('UpdateTranslations', targetValue);
    dispatch({
      type: 'update',
      payload: { lang: languageCode, translation: { [text]: { value: targetValue, scope: 'local' } } },
    });
    setCurrentTranslation(targetValue);
  };

  if (currentTranslation === undefined) {
    return <></>;
  }

  if (htmlElementAsJson?.type === 'Element') {
    return (
      <TranslationFormHtmlItem
        text={text}
        htmlElementAsJson={htmlElementAsJson}
        storedTranslation={currentTranslation}
        updateTranslation={updateTranslations}
      />
    );
  }
  return (
    <TranslationTextInput
      text={text}
      value={currentTranslation}
      type={type}
      key={`${text}-${languageCode}`}
      hasGlobalTranslation={hasGlobalTranslation}
      tempGlobalTranslation={tempGlobalTranslation}
      showGlobalTranslation={showGlobalTranslation}
      onChange={updateTranslations}
      setHasGlobalTranslation={setHasGlobalTranslation}
      setGlobalTranslation={setCurrentTranslation}
    />
  );
};

export default FormItem;
