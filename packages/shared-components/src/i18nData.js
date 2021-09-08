import { TEXTS, objectUtils } from "@navikt/skjemadigitalisering-shared-domain";

const { flatten, addToMap } = objectUtils;

const { validering, grensesnitt, ...remainingTexts } = TEXTS;
const { navigation, ...remainingGrensesnittTexts } = grensesnitt;

const i18nData = {
  "nb-NO": {
    //Erstattes av globalt oversatte skjematekster når globale oversettelser er klar
    optional: "valgfritt",
    month: "Måned",
    day: "Dag",
    year: "År",
    january: "Januar",
    february: "Februar",
    march: "Mars",
    april: "April",
    may: "Mai",
    june: "Juni",
    july: "Juli",
    august: "August",
    september: "September",
    october: "Oktober",
    november: "November",
    december: "Desember",

    ...flatten({ validering, navigation }, ([key, value]) => ({ key, value })).reduce(addToMap, {}),
    ...flatten({ remainingGrensesnittTexts, remainingTexts }, ([_, value]) => ({
      key: value,
      value,
    })).reduce(addToMap, {}),
  },
  "nn-NO": {},
  en: {},
  pl: {},
};
export default i18nData;
