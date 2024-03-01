import { SendInnAktivitet, SubmissionActivity, dateUtils } from '@navikt/skjemadigitalisering-shared-domain';

export const mapActivityText = (activity: SendInnAktivitet) => {
  return `${activity.aktivitetsnavn}: ${dateUtils.toLocaleDate(activity.periode.fom)} - ${dateUtils.toLocaleDate(
    activity.periode.tom,
  )}`;
};

export const mapVedtak = (activities: SendInnAktivitet[]) => {
  return activities.reduce<SubmissionActivity[]>((acc, activity) => {
    const vedtaksinformasjon = activity.saksinformasjon.vedtaksinformasjon;

    const vedtak = vedtaksinformasjon.map(
      (vedtak): SubmissionActivity => ({
        aktivitetId: activity.aktivitetId,
        maalgruppe: activity.maalgruppe,
        periode: vedtak.periode,
        text: mapActivityText(activity),
        vedtaksId: vedtak.vedtakId,
      }),
    );

    return [...acc, ...vedtak];
  }, []);
};

export const mapActivities = (activities: SendInnAktivitet[]) => {
  return activities.map((activity): SubmissionActivity => {
    return {
      aktivitetId: activity.aktivitetId,
      maalgruppe: activity.maalgruppe,
      periode: activity.periode,
      text: mapActivityText(activity),
    };
  });
};

export const mapToSubmissionActivity = (
  activities: SendInnAktivitet[],
  type: 'aktivitet' | 'vedtak',
): SubmissionActivity[] => {
  if (type === 'aktivitet') {
    return mapActivities(activities);
  } else if (type === 'vedtak') {
    return mapVedtak(activities);
  }
  return [];
};
