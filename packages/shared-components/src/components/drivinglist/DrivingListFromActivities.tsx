import { Accordion, Alert, BodyShort, Heading } from '@navikt/ds-react';
import {
  AktivitetVedtaksinformasjon,
  SendInnAktivitet,
  SubmissionActivity,
  TEXTS,
  VedtakBetalingsplan,
  dateUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { useComponentUtils } from '../../context/component/componentUtilsContext';
import { mapToSubmissionActivity, mapToVedtaklist } from '../../formio/components/core/activities/Activities.utils';
import { drivingListMetadata } from '../../formio/components/core/driving-list/DrivingList.utils';
import { useDrivingList } from '../../formio/components/core/driving-list/DrivingListContext';
import makeStyles from '../../util/styles/jss/jss';
import NavActivities from '../activities/NavActivities';
import InnerHtml from '../inner-html/InnerHtml';
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
  const { values, updateValues, getComponentError } = useDrivingList();
  const { translate, locale, addRef } = useComponentUtils();

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
    const periodTo = betalingsplan.utgiftsperiode.tom;

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
          <InnerHtml content={translate(TEXTS.statiske.drivingList.parkingInfo)} />
        </Alert>
      );
    }
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
          label={translate(drivingListMetadata('activityRadio').label)}
          value={vedtakSelection}
          onChange={(activity?: SubmissionActivity, options?: ActivityChangeOptions) =>
            onActivityChange(activity, options)
          }
          className={'mb'}
          dataType="vedtak"
          activities={activities}
          error={getComponentError('activityRadio')}
          ref={(ref) => addRef('activityRadio', ref)}
          shouldAutoSelectSingleActivity={true}
        />
        {selectedActivity && selectedVedtak && (
          <>
            <PeriodInfo />
            {parkingInfoAlert(selectedVedtak)}
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
                  {translate(TEXTS.statiske.drivingList.previousDrivingList)}
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
                            {`${dateUtils.toLocaleDateLongMonth(periodFrom, locale)} - ${dateUtils.toLocaleDateLongMonth(periodTo, locale)} (${betalingsplan.beloep} kr)`}
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
