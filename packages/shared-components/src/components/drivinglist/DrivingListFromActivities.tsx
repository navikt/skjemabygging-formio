import { Accordion, BodyShort, Heading } from '@navikt/ds-react';
import {
  AktivitetVedtaksinformasjon,
  DrivingListSubmission,
  DrivingListValues,
  SendInnAktivitet,
  SubmissionActivity,
  TEXTS,
  VedtakBetalingsplan,
} from '@navikt/skjemadigitalisering-shared-domain';
import { TFunction } from 'i18next';
import { AppConfigContextType } from '../../context/config/configContext';
import { mapToSubmissionActivity } from '../../formio/components/core/activities/Activities.utils';
import { drivingListMetadata, toLocaleDate } from '../../formio/components/core/driving-list/DrivingList.utils';
import makeStyles from '../../util/styles/jss/jss';
import NavActivities from '../activities/NavActivities';
import ActivityAlert from './ActivityAlert';
import DrivingPeriod from './DrivingPeriod';

type Props = {
  values: DrivingListSubmission;
  t: TFunction;
  updateValues: (values: DrivingListValues) => void;
  activities: SendInnAktivitet[];
  appConfig: AppConfigContextType;
};

const useDrivinglistStyles = makeStyles({
  paddingBottom: {
    paddingBottom: '2.5rem',
  },
  marginBottom: {
    marginBottom: '2.5rem',
  },
});

const DrivingListFromActivities = ({ values, t, updateValues, activities, appConfig }: Props) => {
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
        t={t}
        index={index}
        hasParking={vedtak.trengerParkering}
        updateValues={updateValues}
        betalingsplanId={betalingsplan.betalingsplanId}
        periodFrom={periodFrom}
        periodTo={periodTo}
        values={values}
        refundAmount={betalingsplan.beloep}
        dailyRate={vedtak.dagsats}
      />
    );
  };

  const renderDrivingListFromActivities = () => {
    const activitySelections = mapToSubmissionActivity(activities, 'vedtak');
    const activitySelection = activitySelections.find((activity) => activity.vedtaksId === values?.selectedVedtaksId);

    const activity = activities.find((activity) =>
      activity.saksinformasjon.vedtaksinformasjon.some((vedtak) => vedtak.vedtakId === values?.selectedVedtaksId),
    );
    const vedtak = activity?.saksinformasjon?.vedtaksinformasjon?.find(
      (vedtak) => vedtak.vedtakId === values?.selectedVedtaksId,
    );

    const alreadyRefunded = vedtak?.betalingsplan.filter((x) => !x.journalpostId) ?? [];

    return (
      <>
        <NavActivities
          id={drivingListMetadata('activityRadio').id}
          label={t(drivingListMetadata('activityRadio').label)}
          value={activitySelection}
          onChange={(activity) => onActivityChange(activity)}
          appConfig={appConfig}
          t={t}
          className={styles.paddingBottom}
          dataType="vedtak"
          activities={activities}
        />
        {activity && vedtak && (
          <>
            <ActivityAlert
              activityName={activity.aktivitetsnavn}
              vedtak={vedtak}
              t={t}
              className={styles.marginBottom}
            />
            <Accordion tabIndex={-1} id={drivingListMetadata('dates').id} className={styles.paddingBottom} size="small">
              {vedtak?.betalingsplan
                .filter((x) => !!x.journalpostId === false)
                .filter((x) => new Date(x.utgiftsperiode.tom) < new Date())
                .sort((a, b) => new Date(a.utgiftsperiode.fom).getTime() - new Date(b.utgiftsperiode.fom).getTime())
                .map((betalingsplan, index) => renderDrivingPeriodsFromActivities(betalingsplan, index, vedtak))}
            </Accordion>
            {alreadyRefunded.length > 0 && (
              <>
                <Heading size="small" spacing={true}>
                  {t(TEXTS.statiske.drivingList.previousDrivingList)}
                </Heading>
                <ul>
                  {vedtak?.betalingsplan
                    .filter((x) => !!x.journalpostId === true)
                    .sort((a, b) => new Date(a.utgiftsperiode.fom).getTime() - new Date(b.utgiftsperiode.fom).getTime())
                    .map((betalingsplan) => {
                      const periodFrom = new Date(betalingsplan.utgiftsperiode.fom);
                      const periodTo = new Date(betalingsplan.utgiftsperiode.tom);
                      return (
                        <li key={betalingsplan.betalingsplanId}>
                          <BodyShort size="medium">
                            {`${toLocaleDate(periodFrom)} - ${toLocaleDate(periodTo)} (${betalingsplan.beloep} kr)`}
                          </BodyShort>
                        </li>
                      );
                    })}
                </ul>
              </>
            )}
          </>
        )}
      </>
    );
  };

  return renderDrivingListFromActivities();
};

export default DrivingListFromActivities;
