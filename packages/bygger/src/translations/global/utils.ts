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

const getAllPredefinedOriginalTexts = (): string[] => {
  const { grensesnitt, statiske, validering, common } = TEXTS;
  return objectUtils.flattenToArray({ ...grensesnitt, ...statiske, ...validering, ...common }, (entry) => {
    return entry[1].toUpperCase();
  });
};

export { tags, flattenTextsForEditPanel, getAllPredefinedOriginalTexts };
