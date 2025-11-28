import { dateUtils, TEXTS, TranslateFunction } from '@navikt/skjemadigitalisering-shared-domain';

const getDrivingListItems = (dates: any, currentLanguage: string, translate: TranslateFunction) => {
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
