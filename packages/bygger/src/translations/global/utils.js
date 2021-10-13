import { getInputType, removeDuplicatedComponents } from "../utils";
import { objectUtils, TEXTS } from "@navikt/skjemadigitalisering-shared-domain";
import merge from "lodash.merge";

const flattenTextsForEditPanel = (texts) => {
  return removeDuplicatedComponents(
    objectUtils.flattenToArray(texts, (entry, parentKey) => {
      const key = objectUtils.concatKeys(entry[0], parentKey);
      const text = entry[1];
      return { key, text, type: getInputType(text) };
    })
  );
};

const getAllPredefinedOriginalTexts = () => {
  const { grensesnitt, statiske, validering, common } = TEXTS;
  return objectUtils.flattenToArray(merge(grensesnitt, statiske, validering, common), (entry) => {
    return entry[1].toUpperCase();
  });
};

export { flattenTextsForEditPanel, getAllPredefinedOriginalTexts };
