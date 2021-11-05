import { getInputType, removeDuplicatedComponents } from "../utils";
import { objectUtils, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";

const tags = {
  SKJEMATEKSTER: "skjematekster",
  GRENSESNITT: "grensesnitt",
  STATISKE_TEKSTER: "statiske-tekster",
  VALIDERING: "validering",
};

const flattenTextsForEditPanel = (texts: any): Array<any> => {
  return removeDuplicatedComponents(
    objectUtils.flattenToArray(texts, (entry, parentKey) => {
      const key = objectUtils.concatKeys(entry[0], parentKey);
      const text = entry[1];
      return { key, text, type: getInputType(text) };
    })
  );
};

const getAllPredefinedOriginalTexts = (skipUpperCasing = false): string[] => {
  const { grensesnitt, statiske, validering, common } = TEXTS;
  return objectUtils.flattenToArray({ ...grensesnitt, ...statiske, ...validering, ...common }, (entry) => {
    return skipUpperCasing ? entry[1] : entry[1].toUpperCase();
  });
};

const getCurrentOriginalTextList = (currentTranslation: Array<any>): string[] => {
  return currentTranslation.reduce((originalTextList, translations) => {
    const { originalText } = translations;
    if (originalText !== "") return [...originalTextList, originalText.toUpperCase()];
    else return originalTextList;
  }, []);
};

export { tags, flattenTextsForEditPanel, getAllPredefinedOriginalTexts, getCurrentOriginalTextList };
