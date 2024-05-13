import { Accordion, Alert, BodyShort, Heading } from '@navikt/ds-react';
import {
  AktivitetVedtaksinformasjon,
  SendInnAktivitet,
  SubmissionActivity,
  TEXTS,
  VedtakBetalingsplan,
  dateUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { mapToSubmissionActivity, mapToVedtaklist } from '../../formio/components/core/activities/Activities.utils';
import { drivingListMetadata } from '../../formio/components/core/driving-list/DrivingList.utils';
import { useDrivingList } from '../../formio/components/core/driving-list/DrivingListContext';
import makeStyles from '../../util/styles/jss/jss';
import NavActivities from '../activities/NavActivities';
import ActivityAlert from './ActivityAlert';
import DrivingPeriod from './DrivingPeriod';
import PeriodInfo from './PeriodInfo';

type Props = {
  activities: SendInnAktivitet[];
};

type ActivityChangeOptions = {
  autoSelect?: boolean;
};

const useDrivinglistStyles = makeStyles({
  accoridonHeader: {
    marginBottom: 'var(--a-spacing-3)',
  },
});

const DrivingListFromActivities = ({ activities }: Props) => {
  const { values, updateValues, t, appConfig, getComponentError, addRef, locale } = useDrivingList();

  const styles = useDrivinglistStyles();

  const onActivityChange = (activity?: SubmissionActivity, options?: ActivityChangeOptions) => {
    if (options?.autoSelect) {
      updateValues({ selectedVedtaksId: activity?.vedtaksId });
    } else {
      updateValues({ selectedVedtaksId: activity?.vedtaksId, dates: [] });
    }
  };

  const renderDrivingPeriodsFromActivities = (
    betalingsplan: VedtakBetalingsplan,
    index: number,
    vedtak: AktivitetVedtaksinformasjon,
  ) => {
    const periodFrom = betalingsplan.utgiftsperiode.fom;
    const periodTo = betalingsplan.utgiftsperiode.tom ?? new Date().toISOString();

    return (
      <DrivingPeriod
        key={betalingsplan.betalingsplanId}
        index={index}
        hasParking={vedtak.trengerParkering}
        periodFrom={periodFrom}
        periodTo={periodTo}
        dailyRate={vedtak.dagsats}
        betalingsplan={betalingsplan}
      />
    );
  };

  const parkingInfoAlert = (selectedVedtak: AktivitetVedtaksinformasjon) => {
    if (selectedVedtak.trengerParkering) {
      return (
        <Alert variant="info" className="mb">
          <div dangerouslySetInnerHTML={{ __html: TEXTS.statiske.drivingList.parkingInfo }} />
        </Alert>
      );
    }
  };

  const noPeriodsAlert = (vedtakPeriods: VedtakBetalingsplan[], selectedVedtak: AktivitetVedtaksinformasjon) => {
    if (vedtakPeriods.length === 0) {
      const futurePeriodEnds = selectedVedtak?.betalingsplan
        ?.filter((x) => !!x.journalpostId === false)
        ?.filter((x) => (x.utgiftsperiode.tom ? new Date(x.utgiftsperiode?.tom) > new Date() : true));

      const nextPeriodEnd = futurePeriodEnds?.[0]?.utgiftsperiode?.tom;

      if (!nextPeriodEnd) return null;
      return (
        <Alert variant="info" className="mb">
          <BodyShort>
            {t(TEXTS.statiske.drivingList.noPeriods, {
              date: dateUtils.toLocaleDateLongMonth(nextPeriodEnd, locale),
            })}
          </BodyShort>
        </Alert>
      );
    }
  };

  const filteredVedtakPeriods = (selectedVedtak: AktivitetVedtaksinformasjon) => {
    return selectedVedtak?.betalingsplan
      ?.filter((x) => !!x.journalpostId === false)
      ?.filter((x) => (x.utgiftsperiode?.tom ? new Date(x.utgiftsperiode.tom) < new Date() : true))
      ?.sort((a, b) => new Date(a.utgiftsperiode.fom).getTime() - new Date(b.utgiftsperiode.fom).getTime());
  };

  const renderDrivingListFromActivities = () => {
    const activitySelections = mapToSubmissionActivity(activities, 'vedtak', locale);
    const vedtakSelection = activitySelections.find((activity) => activity.vedtaksId === values?.selectedVedtaksId);

    const selectedActivity = activities.find((activity) =>
      activity.saksinformasjon.vedtaksinformasjon.some((vedtak) => vedtak.vedtakId === values?.selectedVedtaksId),
    );
    const selectedVedtak = selectedActivity?.saksinformasjon?.vedtaksinformasjon?.find(
      (vedtak) => vedtak.vedtakId === values?.selectedVedtaksId,
    );

    const alreadyRefunded = selectedVedtak?.betalingsplan.filter((x) => !!x.journalpostId === true) ?? [];

    return (
      <>
        <ActivityAlert vedtakData={mapToVedtaklist(activities)} className={'mb'} />
        <NavActivities
          id={drivingListMetadata('activityRadio').id}
          label={t(drivingListMetadata('activityRadio').label)}
          value={vedtakSelection}
          onChange={(activity?: SubmissionActivity, options?: ActivityChangeOptions) =>
            onActivityChange(activity, options)
          }
          appConfig={appConfig}
          t={t}
          className={'mb'}
          dataType="vedtak"
          activities={activities}
          error={getComponentError('activityRadio')}
          ref={(ref) => addRef('activityRadio', ref)}
          locale={locale}
          shouldAutoSelectSingleActivity={true}
        />
        {selectedActivity && selectedVedtak && (
          <>
            <PeriodInfo />
            {parkingInfoAlert(selectedVedtak)}
            <Heading size="xsmall" className={styles.accoridonHeader}>
              {TEXTS.statiske.drivingList.accordionHeader}
            </Heading>
            {noPeriodsAlert(filteredVedtakPeriods(selectedVedtak), selectedVedtak)}
            <Accordion
              tabIndex={-1}
              id={drivingListMetadata('dates').id}
              className={'mb'}
              size="small"
              ref={(ref) => addRef('dates', ref)}
            >
              {filteredVedtakPeriods(selectedVedtak).map((betalingsplan, index) =>
                renderDrivingPeriodsFromActivities(betalingsplan, index, selectedVedtak),
              )}
            </Accordion>

            {alreadyRefunded.length > 0 && (
              <div className={'mb'}>
                <Heading size="small" spacing={true}>
                  {t(TEXTS.statiske.drivingList.previousDrivingList)}
                </Heading>
                <ul>
                  {alreadyRefunded
                    .sort((a, b) => new Date(a.utgiftsperiode.fom).getTime() - new Date(b.utgiftsperiode.fom).getTime())
                    .map((betalingsplan) => {
                      const periodFrom = betalingsplan.utgiftsperiode.fom;
                      const periodTo = betalingsplan.utgiftsperiode.tom;
                      return (
                        <li key={betalingsplan.betalingsplanId}>
                          <BodyShort size="medium">
                            {`${dateUtils.toLocaleDateLongMonth(periodFrom, locale)} ${periodTo ? ' - ' + dateUtils.toLocaleDateLongMonth(periodTo, locale) : ''} (${betalingsplan.beloep} kr)`}
                          </BodyShort>
                        </li>
                      );
                    })}
                </ul>
              </div>
            )}
          </>
        )}
      </>
    );
  };

  return renderDrivingListFromActivities();
};

export default DrivingListFromActivities;
