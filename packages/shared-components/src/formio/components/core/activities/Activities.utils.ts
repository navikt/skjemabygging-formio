import {
  AktivitetVedtaksinformasjon,
  SendInnAktivitet,
  SubmissionActivity,
  dateUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { ActivityAlertData } from '../driving-list/DrivingList.utils';

export const mapActivityText = (activity: SendInnAktivitet, locale: string) => {
  if (!activity.periode.fom) {
    return activity.aktivitetsnavn;
  }

  return `${activity.aktivitetsnavn}: ${dateUtils.toLocaleDateLongMonth(activity.periode.fom, locale)} - ${
    activity.periode.tom ? dateUtils.toLocaleDateLongMonth(activity.periode.tom, locale) : ''
  }`;
};

export const mapVedtakText = (activity: SendInnAktivitet, vedtak: AktivitetVedtaksinformasjon, locale: string) => {
  if (!vedtak.periode.fom) {
    return activity.aktivitetsnavn;
  }

  return `${activity.aktivitetsnavn}: ${dateUtils.toLocaleDateLongMonth(vedtak.periode.fom, locale)} - ${
    vedtak.periode.tom ? dateUtils.toLocaleDateLongMonth(vedtak.periode.tom, locale) : ''
  }`;
};

export const mapVedtak = (activities: SendInnAktivitet[], locale: string) => {
  return activities.reduce<SubmissionActivity[]>((acc, activity) => {
    const vedtaksinformasjon = activity.saksinformasjon.vedtaksinformasjon;

    const vedtak = vedtaksinformasjon
      .filter((x) => !!x.betalingsplan.length)
      .map(
        (vedtak): SubmissionActivity => ({
          aktivitetId: activity.aktivitetId,
          maalgruppe: activity.maalgruppe,
          periode: vedtak.periode,
          text: mapVedtakText(activity, vedtak, locale),
          vedtaksId: vedtak.vedtakId,
        }),
      );

    return [...acc, ...vedtak];
  }, []);
};

export const mapActivities = (activities: SendInnAktivitet[], locale: string) => {
  return activities.map((activity): SubmissionActivity => {
    return {
      aktivitetId: activity.aktivitetId,
      maalgruppe: activity.maalgruppe,
      periode: activity.periode,
      text: mapActivityText(activity, locale),
    };
  });
};

export const mapToSubmissionActivity = (
  activities: SendInnAktivitet[],
  type: 'aktivitet' | 'vedtak',
  locale: string,
): SubmissionActivity[] => {
  if (type === 'aktivitet') {
    return mapActivities(activities, locale);
  } else if (type === 'vedtak') {
    return mapVedtak(activities, locale);
  }
  return [];
};

export const mapToVedtaklist = (activities: SendInnAktivitet[]) => {
  return activities.reduce<ActivityAlertData[]>((acc, activity) => {
    const vedtaksinformasjon = activity.saksinformasjon.vedtaksinformasjon;

    const vedtak = vedtaksinformasjon
      .filter((x) => !!x.betalingsplan.length)
      .map((vedtak) => ({
        aktivitetsnavn: activity.aktivitetsnavn,
        dagsats: vedtak.dagsats,
        periode: vedtak.periode,
        vedtaksId: vedtak.vedtakId,
      }));

    return [...acc, ...vedtak];
  }, []);
};
