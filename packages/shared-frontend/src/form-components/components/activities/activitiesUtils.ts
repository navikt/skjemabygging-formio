import { SendInnAktivitet, SubmissionActivity, dateUtils } from '@navikt/skjemadigitalisering-shared-domain';

const toActivitiesLocale = (language: string) => {
  if (language === 'en') {
    return 'en-US';
  }

  if (language === 'nn') {
    return 'nn-NO';
  }

  return 'nb-NO';
};

const mapActivityText = (activity: SendInnAktivitet, language: string) => {
  if (!activity.periode.fom) {
    return activity.aktivitetsnavn;
  }

  const locale = toActivitiesLocale(language);

  return `${activity.aktivitetsnavn}: ${dateUtils.toLocaleDateLongMonth(activity.periode.fom, locale)} - ${
    activity.periode.tom ? dateUtils.toLocaleDateLongMonth(activity.periode.tom, locale) : ''
  }`;
};

const mapActivities = (activities: SendInnAktivitet[], language: string): SubmissionActivity[] =>
  activities.map((activity) => ({
    aktivitetId: activity.aktivitetId,
    maalgruppe: activity.maalgruppe,
    periode: activity.periode,
    text: mapActivityText(activity, language),
  }));

const getSelectedActivityId = (value?: SubmissionActivity) => value?.vedtaksId ?? value?.aktivitetId ?? '';

export { getSelectedActivityId, mapActivities, mapActivityText, toActivitiesLocale };
