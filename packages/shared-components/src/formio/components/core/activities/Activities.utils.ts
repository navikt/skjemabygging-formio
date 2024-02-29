import { SendInnAktivitet, SubmissionActivity, dateUtils } from '@navikt/skjemadigitalisering-shared-domain';

export const mapActivityText = (activity: SendInnAktivitet) => {
  return `${activity.aktivitetsnavn}: ${dateUtils.toLocaleDate(activity.periode.fom)} - ${dateUtils.toLocaleDate(
    activity.periode.tom,
  )}`;
};

export const mapActivity = (activity: SendInnAktivitet): SubmissionActivity => {
  return {
    aktivitetId: activity.aktivitetId,
    maalgruppe: activity.maalgruppe,
    periode: activity.periode,
    text: mapActivityText(activity),
  };
};
