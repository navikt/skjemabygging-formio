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

const fetchActivities = async (dagligreise = false): Promise<SendInnAktivitet[]> => {
  const params = new URLSearchParams(window.location.search);
  const innsendingsId = params.get('innsendingsId');
  const response = await fetch(`/fyllut/api/send-inn/activities?dagligreise=${dagligreise}`, {
    headers: innsendingsId ? { 'x-innsendingsid': innsendingsId } : undefined,
  });

  if (!response.ok) {
    throw new Error(`Failed to load activities: ${response.status}`);
  }

  return response.json() as Promise<SendInnAktivitet[]>;
};

export { fetchActivities, getSelectedActivityId, mapActivities, mapActivityText, toActivitiesLocale };
