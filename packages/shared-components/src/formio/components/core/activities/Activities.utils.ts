import {
  AktivitetVedtaksinformasjon,
  SendInnAktivitet,
  SubmissionActivity,
  dateUtils,
} from '@navikt/skjemadigitalisering-shared-domain';

export const mapActivityText = (activity: SendInnAktivitet) => {
  if (!activity.periode.fom) {
    return activity.aktivitetsnavn;
  }

  return `${activity.aktivitetsnavn}: ${dateUtils.toLocaleDate(activity.periode.fom)} - ${
    activity.periode.tom ? dateUtils.toLocaleDate(activity.periode.tom) : ''
  }`;
};

export const mapVedtakText = (activity: SendInnAktivitet, vedtak: AktivitetVedtaksinformasjon) => {
  if (!vedtak.periode.fom) {
    return activity.aktivitetsnavn;
  }

  return `${activity.aktivitetsnavn}: ${dateUtils.toLocaleDate(vedtak.periode.fom)} - ${
    vedtak.periode.tom ? dateUtils.toLocaleDate(vedtak.periode.tom) : ''
  }`;
};

export const mapVedtak = (activities: SendInnAktivitet[]) => {
  return activities.reduce<SubmissionActivity[]>((acc, activity) => {
    const vedtaksinformasjon = activity.saksinformasjon.vedtaksinformasjon;

    const vedtak = vedtaksinformasjon
      .filter((x) => !!x.betalingsplan.length)
      .map(
        (vedtak): SubmissionActivity => ({
          aktivitetId: activity.aktivitetId,
          maalgruppe: activity.maalgruppe,
          periode: vedtak.periode,
          text: mapVedtakText(activity, vedtak),
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
