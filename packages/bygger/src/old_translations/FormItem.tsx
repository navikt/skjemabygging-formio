import { ArrowUndoIcon } from '@navikt/aksel-icons';
import { Button } from '@navikt/ds-react';
import { htmlConverter, makeStyles } from '@navikt/skjemadigitalisering-shared-components';
import { ScopedTranslationMap } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { useI18nDispatch } from '../context/i18n';
import TranslationFormHtmlSection from './TranslationFormHtmlSection';
import TranslationTextInput from './TranslationTextInput';

const useStyles = makeStyles({
  undoButton: {
    width: 'fit-content',
    margin: 'var(--a-spacing-4) 0',
  },
});
interface Props {
  translations: ScopedTranslationMap;
  text: string;
  type: string;
  languageCode: string;
}

const FormItem = ({ translations, text, type, languageCode }: Props) => {
  const [showGlobalTranslation, setShowGlobalTranslation] = useState(false);
  const [hasGlobalTranslation, setHasGlobalTranslation] = useState(false);
  const [currentTranslation, setCurrentTranslation] = useState<string>();
  const [tempGlobalTranslation, setTempGlobalTranslation] = useState('');
  const [useLegacyHtmlTranslation, setUseLegacyHtmlTranslation] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<string>();

  const dispatch = useI18nDispatch();
  const styles = useStyles();

  useEffect(() => {
    if (translations && translations[text]) {
      if (translations[text].scope === 'global') {
        setHasGlobalTranslation(true);
        setShowGlobalTranslation(true);
        setTempGlobalTranslation(translations[text].value ?? '');
      }
      if (currentLanguage !== languageCode && currentTranslation !== translations[text].value) {
        setCurrentTranslation(translations[text].value ?? '');
        setCurrentLanguage(languageCode);
      }
    } else {
      if (currentLanguage !== languageCode) {
        setCurrentTranslation('');
        setCurrentLanguage(languageCode);
      }
      setHasGlobalTranslation(false);
      setShowGlobalTranslation(false);
    }
  }, [translations, text, currentLanguage, currentTranslation, languageCode]);

  const updateTranslations = (targetValue: string) => {
    setCurrentTranslation(targetValue);
    dispatch({
      type: 'update',
      payload: { lang: languageCode, translation: { [text]: { value: targetValue, scope: 'local' } } },
    });
  };

  if (currentTranslation === undefined) {
    return <></>;
  }

  if (htmlConverter.isHtmlString(text) && !useLegacyHtmlTranslation) {
    return (
      <TranslationFormHtmlSection
        text={text}
        storedTranslation={currentTranslation}
        updateTranslation={updateTranslations}
        onSelectLegacy={() => setUseLegacyHtmlTranslation(true)}
      />
    );
  }

  return (
    <div className="mb-4">
      {useLegacyHtmlTranslation && (
        <Button
          className={styles.undoButton}
          type="button"
          size="small"
          variant="secondary"
          onClick={() => setUseLegacyHtmlTranslation(false)}
          icon={<ArrowUndoIcon aria-hidden />}
        >
          Gå tilbake til vanlig HTML-oversetting
        </Button>
      )}
      <TranslationTextInput
        text={text}
        value={currentTranslation}
        type={type}
        hasGlobalTranslation={hasGlobalTranslation}
        tempGlobalTranslation={tempGlobalTranslation}
        showGlobalTranslation={showGlobalTranslation}
        onChange={updateTranslations}
        onBlur={undefined}
        setHasGlobalTranslation={setHasGlobalTranslation}
        setGlobalTranslation={setCurrentTranslation}
      />
    </div>
  );
};

export default FormItem;
