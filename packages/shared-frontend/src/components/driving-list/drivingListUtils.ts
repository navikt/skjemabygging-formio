import {
  AktivitetVedtaksinformasjon,
  SendInnAktivitet,
  SubmissionActivity,
  VedtakBetalingsplan,
  dateUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { inputId } from '../../utils/inputId';
import { toActivitiesLocale } from '../activities/activitiesUtils';

type DrivingListDate = {
  date: string;
  parking: string;
  betalingsplanId?: string;
};

type ActivityAlertData = {
  aktivitetsnavn: string;
  dagsats: number;
  periode: AktivitetVedtaksinformasjon['periode'];
  vedtaksId: string;
};

const DRIVING_LIST_MAX_PARKING_EXPENSE = 100;

const mapVedtakText = (activity: SendInnAktivitet, vedtak: AktivitetVedtaksinformasjon, language: string) => {
  if (!vedtak.periode.fom) {
    return activity.aktivitetsnavn;
  }

  const locale = toActivitiesLocale(language);

  return `${activity.aktivitetsnavn}: ${dateUtils.toLocaleDateLongMonth(vedtak.periode.fom, locale)} - ${
    vedtak.periode.tom ? dateUtils.toLocaleDateLongMonth(vedtak.periode.tom, locale) : ''
  }`;
};

const mapVedtakActivities = (activities: SendInnAktivitet[], language: string): SubmissionActivity[] =>
  activities.reduce<SubmissionActivity[]>((acc, activity) => {
    const vedtak = activity.saksinformasjon.vedtaksinformasjon
      .filter((item) => item.betalingsplan.length > 0)
      .map((item): SubmissionActivity => ({
        aktivitetId: activity.aktivitetId,
        maalgruppe: activity.maalgruppe,
        periode: item.periode,
        text: mapVedtakText(activity, item, language),
        vedtaksId: item.vedtakId,
        tema: activity.saksinformasjon.sakstype,
      }));

    return [...acc, ...vedtak];
  }, []);

const mapToVedtakList = (activities: SendInnAktivitet[]): ActivityAlertData[] =>
  activities.reduce<ActivityAlertData[]>((acc, activity) => {
    const vedtak = activity.saksinformasjon.vedtaksinformasjon
      .filter((item) => item.betalingsplan.length > 0)
      .map((item) => ({
        aktivitetsnavn: activity.aktivitetsnavn,
        dagsats: item.dagsats,
        periode: item.periode,
        vedtaksId: item.vedtakId,
      }));

    return [...acc, ...vedtak];
  }, []);

const findSelectedVedtak = (activities: SendInnAktivitet[], selectedVedtaksId?: string) => {
  if (!selectedVedtaksId) {
    return {};
  }

  const selectedActivity = activities.find((activity) =>
    activity.saksinformasjon.vedtaksinformasjon.some((vedtak) => vedtak.vedtakId === selectedVedtaksId),
  );
  const selectedVedtak = selectedActivity?.saksinformasjon.vedtaksinformasjon.find(
    (vedtak) => vedtak.vedtakId === selectedVedtaksId,
  );

  return { selectedActivity, selectedVedtak };
};

const getAvailablePeriods = (selectedVedtak?: AktivitetVedtaksinformasjon): VedtakBetalingsplan[] =>
  selectedVedtak?.betalingsplan
    ?.filter((item) => !item.journalpostId)
    ?.filter((item) => new Date(item.utgiftsperiode.tom) < new Date())
    ?.sort((a, b) => new Date(a.utgiftsperiode.fom).getTime() - new Date(b.utgiftsperiode.fom).getTime()) ?? [];

const getFuturePeriodEnd = (selectedVedtak?: AktivitetVedtaksinformasjon) =>
  selectedVedtak?.betalingsplan
    ?.filter((item) => !item.journalpostId)
    ?.filter((item) => new Date(item.utgiftsperiode.tom) > new Date())
    ?.sort((a, b) => new Date(a.utgiftsperiode.tom).getTime() - new Date(b.utgiftsperiode.tom).getTime())?.[0]
    ?.utgiftsperiode.tom;

const getAlreadyRefundedPeriods = (selectedVedtak?: AktivitetVedtaksinformasjon): VedtakBetalingsplan[] =>
  selectedVedtak?.betalingsplan
    ?.filter((item) => !!item.journalpostId)
    ?.sort((a, b) => new Date(a.utgiftsperiode.fom).getTime() - new Date(b.utgiftsperiode.fom).getTime()) ?? [];

const mergePeriodDates = (
  existingDates: DrivingListDate[],
  selectedDates: string[],
  periodDates: string[],
  betalingsplanId?: string,
): DrivingListDate[] => {
  const datesOutsidePeriod = existingDates.filter((item) => !periodDates.includes(item.date));
  const nextPeriodDates = selectedDates.map((date) => {
    const existing = existingDates.find((item) => item.date === date);

    return {
      date,
      parking: existing?.parking ?? '',
      betalingsplanId: existing?.betalingsplanId ?? betalingsplanId,
    };
  });

  return [...datesOutsidePeriod, ...nextPeriodDates].sort((a, b) => a.date.localeCompare(b.date));
};

const getSelectedDatesForPeriod = (dates: DrivingListDate[], periodDates: string[]) =>
  dates.filter((item) => periodDates.includes(item.date)).map((item) => item.date);

const getParkingFieldPath = (statePath: string, dates: DrivingListDate[], date: string) => {
  const index = dates.findIndex((item) => item.date === date);

  return index >= 0 ? `${statePath}.dates[${index}].parking` : `${statePath}.dates`;
};

const shouldShowExpenseWarning = (
  selectedDatesInPeriod: DrivingListDate[],
  dailyRate?: number,
  refundLimit?: number,
) => {
  if (!refundLimit) {
    return false;
  }

  const totalParking = selectedDatesInPeriod.reduce((sum, item) => sum + Number(item.parking || 0), 0);
  const totalDailyRate = selectedDatesInPeriod.length * (dailyRate ?? 0);

  return totalParking + totalDailyRate > refundLimit;
};

const allPaperFieldsForPeriodsAreSet = (selectedDate?: string, parking?: boolean) =>
  !!selectedDate && parking !== undefined && parking !== null;

const showAddPeriodButton = (
  periods?: {
    periodTo: string;
  }[],
) => {
  if (!periods?.length) {
    return false;
  }

  const lastPeriod = periods.reduce((prev, current) =>
    new Date(prev.periodTo) > new Date(current.periodTo) ? prev : current,
  );
  const lastPeriodDate = new Date(lastPeriod.periodTo);
  lastPeriodDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return lastPeriodDate < today;
};

const showRemovePeriodButton = (periods?: unknown[]) => (periods?.length ?? 0) > 1;

const getActivityFieldId = (statePath: string) => inputId(`${statePath}.selectedVedtaksId`);

export {
  DRIVING_LIST_MAX_PARKING_EXPENSE,
  allPaperFieldsForPeriodsAreSet,
  findSelectedVedtak,
  getActivityFieldId,
  getAlreadyRefundedPeriods,
  getAvailablePeriods,
  getFuturePeriodEnd,
  getParkingFieldPath,
  getSelectedDatesForPeriod,
  mapToVedtakList,
  mapVedtakActivities,
  mergePeriodDates,
  shouldShowExpenseWarning,
  showAddPeriodButton,
  showRemovePeriodButton,
};
export type { ActivityAlertData, DrivingListDate };
