import { TEXTS, objectUtils } from "@navikt/skjemadigitalisering-shared-domain";

const { validering, grensesnitt, ...remainingTexts } = TEXTS;
const { navigation, ...remainingGrensesnittTexts } = grensesnitt;

const i18nData = {
  "nb-NO": {
    //Erstattes av globalt oversatte skjematekster når globale oversettelser er klar
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

    ...objectUtils.flatten({ validering, navigation }),
    ...objectUtils.flatten({ remainingGrensesnittTexts, remainingTexts }, true),
  },
  "nn-NO": {},
  en: {},
  pl: {},
};
export default i18nData;
