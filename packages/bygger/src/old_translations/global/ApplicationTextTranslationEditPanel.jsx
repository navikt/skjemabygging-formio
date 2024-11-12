import { Heading } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import ObsoleteTranslationsPanel from '../ObsoleteTranslationsPanel';
import TranslationTextInput from '../TranslationTextInput';
import { flattenTextsForEditPanel, tags } from './utils';

export const getTranslationByOriginalText = (originalText, translations) =>
  translations.find((translation) => translation.originalText === originalText);

const TranslationEditPanelComponent = ({ components, languageCode, updateTranslation, translations }) => {
  return components.map(({ key, type, text }) => {
    const translationByOriginalText = getTranslationByOriginalText(text, translations);
    const id = translationByOriginalText?.id || '';
    const value = translationByOriginalText?.translatedText || '';
    return (
      <TranslationTextInput
        text={text}
        value={value}
        type={type}
        key={`${key}-${languageCode}`}
        hasGlobalTranslation={false}
        showGlobalTranslation={false}
        onChange={(value) => updateTranslation(id, text, value)}
      />
    );
  });
};

const ApplicationTextTranslationEditPanel = ({
  selectedTag,
  translations,
  languageCode,
  updateTranslation,
  deleteOneRow,
}) => {
  const [applicationTexts, setApplicationTexts] = useState([]);
  const [pdfStaticTexts, setPdfStaticTexts] = useState([]);
  const [obsoleteTranslations, setObsoleteTranslations] = useState([]);

  useEffect(() => {
    const { grensesnitt, statiske, validering, common, pdfStatiske } = TEXTS;

    if (selectedTag === tags.STATISKE_TEKSTER) setPdfStaticTexts(flattenTextsForEditPanel(pdfStatiske));
    else setPdfStaticTexts([]);

    switch (selectedTag) {
      case tags.GRENSESNITT:
        setApplicationTexts(flattenTextsForEditPanel({ ...grensesnitt, ...common }));
        break;
      case tags.STATISKE_TEKSTER:
        setApplicationTexts(flattenTextsForEditPanel(statiske));
        break;
      case tags.VALIDERING:
        setApplicationTexts(flattenTextsForEditPanel(validering));
        break;
      default:
        setApplicationTexts([]);
    }
  }, [selectedTag]);

  useEffect(() => {
    const originalTexts = [...applicationTexts.map((at) => at.text), ...pdfStaticTexts.map((pst) => pst.text)];
    const obsolete = translations.filter((t) => t.originalText && !originalTexts.includes(t.originalText));
    setObsoleteTranslations(obsolete);
  }, [applicationTexts, pdfStaticTexts, translations]);

  return (
    <form>
      {obsoleteTranslations.length > 0 && (
        <ObsoleteTranslationsPanel
          translations={obsoleteTranslations}
          onDelete={(t) => deleteOneRow(t.id)}
          className="mb"
        />
      )}
      <TranslationEditPanelComponent
        components={applicationTexts}
        languageCode={languageCode}
        translations={translations}
        updateTranslation={updateTranslation}
      />
      {pdfStaticTexts.length > 0 && (
        <>
          <Heading level="2" size="small">
            Tekster som brukes ved generering av PDF
          </Heading>
          <TranslationEditPanelComponent
            components={pdfStaticTexts}
            languageCode={languageCode}
            translations={translations}
            updateTranslation={updateTranslation}
          />
        </>
      )}
    </form>
  );
};

export default ApplicationTextTranslationEditPanel;
