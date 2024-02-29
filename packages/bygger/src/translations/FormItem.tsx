import { ArrowUndoIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import { HtmlAsJsonElement, HtmlAsJsonTextElement, makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { ScopedTranslationMap } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { useI18nDispatch } from '../context/i18n';
import TranslationFormHtmlSection from './TranslationFormHtmlSection';
import TranslationTextInput from './TranslationTextInput';

const useStyles = makeStyles({
  undoButton: {
    width: 'fit-content',
    marginBottom: 'var(--a-spacing-8)',
  },
});
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
  const [useLegacyHtmlTranslation, setUseLegacyHtmlTranslation] = useState(false);

  const dispatch = useI18nDispatch();
  const styles = useStyles();

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
    dispatch({
      type: 'update',
      payload: { lang: languageCode, translation: { [text]: { value: targetValue, scope: 'local' } } },
    });
    setCurrentTranslation(targetValue);
  };

  if (currentTranslation === undefined) {
    return <></>;
  }

  if (htmlElementAsJson?.type === 'Element' && !useLegacyHtmlTranslation) {
    return (
      <TranslationFormHtmlSection
        text={text}
        htmlElementAsJson={htmlElementAsJson}
        storedTranslation={currentTranslation}
        updateTranslation={updateTranslations}
        onSelectLegacy={() => setUseLegacyHtmlTranslation(true)}
      />
    );
  }
  return (
    <div className="mb-4">
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
      {useLegacyHtmlTranslation && (
        <Button
          className={styles.undoButton}
          size="small"
          variant="secondary"
          onClick={() => setUseLegacyHtmlTranslation(false)}
          icon={<ArrowUndoIcon aria-hidden />}
        >
          Gå tilbake til vanlig HTML oversetting
        </Button>
      )}
    </div>
  );
};

export default FormItem;
