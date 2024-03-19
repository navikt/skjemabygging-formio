import { Accordion, BodyShort, Heading } from '@navikt/ds-react';
import {
  AktivitetVedtaksinformasjon,
  SendInnAktivitet,
  SubmissionActivity,
  TEXTS,
  VedtakBetalingsplan,
} from '@navikt/skjemadigitalisering-shared-domain';
import { mapToSubmissionActivity } from '../../formio/components/core/activities/Activities.utils';
import {
  drivingListMetadata,
  toLocaleDateLongMonth,
} from '../../formio/components/core/driving-list/DrivingList.utils';
import { useDrivingList } from '../../formio/components/core/driving-list/DrivingListContext';
import makeStyles from '../../util/styles/jss/jss';
import NavActivities from '../activities/NavActivities';
import ActivityAlert from './ActivityAlert';
import DrivingPeriod from './DrivingPeriod';

type Props = {
  activities: SendInnAktivitet[];
};

const useDrivinglistStyles = makeStyles({
  accoridonHeader: {
    marginBottom: 'var(--a-spacing-2)',
  },
});

const DrivingListFromActivities = ({ activities }: Props) => {
  const { values, updateValues, t, appConfig, getComponentError, addRef, locale } = useDrivingList();

  const styles = useDrivinglistStyles();

  const onActivityChange = (activity?: SubmissionActivity) => {
    updateValues({ selectedVedtaksId: activity?.vedtaksId, dates: [] });
  };

  const renderDrivingPeriodsFromActivities = (
    betalingsplan: VedtakBetalingsplan,
    index: number,
    vedtak: AktivitetVedtaksinformasjon,
  ) => {
    const periodFrom = new Date(betalingsplan.utgiftsperiode.fom);
    const periodTo = new Date(betalingsplan.utgiftsperiode.tom);

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
        <NavActivities
          id={drivingListMetadata('activityRadio').id}
          label={t(drivingListMetadata('activityRadio').label)}
          value={vedtakSelection}
          onChange={(activity) => onActivityChange(activity)}
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
            <ActivityAlert activityName={selectedActivity.aktivitetsnavn} vedtak={selectedVedtak} className={'mb'} />
            <Heading size="xsmall" className={styles.accoridonHeader}>
              {TEXTS.statiske.drivingList.accordionHeader}
            </Heading>
            <Accordion
              tabIndex={-1}
              id={drivingListMetadata('dates').id}
              className={'mb'}
              size="small"
              ref={(ref) => addRef('dates', ref)}
            >
              {selectedVedtak?.betalingsplan
                .filter((x) => !!x.journalpostId === false)
                .filter((x) => new Date(x.utgiftsperiode.tom) < new Date())
                .sort((a, b) => new Date(a.utgiftsperiode.fom).getTime() - new Date(b.utgiftsperiode.fom).getTime())
                .map((betalingsplan, index) =>
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
                      const periodFrom = new Date(betalingsplan.utgiftsperiode.fom);
                      const periodTo = new Date(betalingsplan.utgiftsperiode.tom);
                      return (
                        <li key={betalingsplan.betalingsplanId}>
                          <BodyShort size="medium">
                            {`${toLocaleDateLongMonth(periodFrom, locale)} - ${toLocaleDateLongMonth(periodTo, locale)} (${betalingsplan.beloep} kr)`}
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
