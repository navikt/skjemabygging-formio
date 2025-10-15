import { dateUtils, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { LanguageContextType } from '../../../../context/languages/languages-context';

const getDrivingListItems = (dates: any, languagesContextValue: LanguageContextType) => {
  const { translate, currentLanguage } = languagesContextValue;

  return dates
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map((date) => {
      const formattedDate = dateUtils.toWeekdayAndDate(date.date, currentLanguage);
      return date.parking
        ? translate(TEXTS.statiske.drivingList.summaryTextParking, {
            date: formattedDate,
            parking: date.parking,
          })
        : formattedDate;
    });
};

export { getDrivingListItems };
