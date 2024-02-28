import { Accordion, BodyShort, Heading } from '@navikt/ds-react';
import {
  SendInnAktivitet,
  SubmissionActivity,
  TEXTS,
  VedtakBetalingsplan,
} from '@navikt/skjemadigitalisering-shared-domain';
import { TFunction } from 'i18next';
import { AppConfigContextType } from '../../context/config/configContext';
import {
  DrivingListSubmission,
  DrivingListValues,
  drivingListMetadata,
  toLocaleDate,
} from '../../formio/components/core/driving-list/DrivingList.utils';
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

  const onActivityChange = (activity?: SendInnAktivitet | SubmissionActivity) => {
    updateValues({ selectedActivity: activity?.aktivitetId, dates: [] });
  };

  const renderDrivingPeriodsFromActivities = (
    betalingsplan: VedtakBetalingsplan,
    index: number,
    hasParking: boolean,
  ) => {
    const periodFrom = new Date(betalingsplan.utgiftsperiode.fom);
    const periodTo = new Date(betalingsplan.utgiftsperiode.tom);

    return (
      <DrivingPeriod
        t={t}
        index={index}
        hasParking={hasParking}
        updateValues={updateValues}
        key={betalingsplan.betalingsplanId}
        periodFrom={periodFrom}
        periodTo={periodTo}
        values={values}
      />
    );
  };

  const renderDrivingListFromActivities = () => {
    const activity = activities.find((x) => x.aktivitetId === values?.selectedActivity);
    // FIXME: Is it always the first vedtak?
    const vedtak = activity?.saksinformasjon?.vedtaksinformasjon?.[0];
    const alreadyRefunded = vedtak?.betalingsplan.filter((x) => !x.journalpostId) ?? [];

    return (
      <>
        <NavActivities
          id={drivingListMetadata('activityRadio').id}
          label={t(drivingListMetadata('activityRadio').label)}
          value={activity}
          onChange={(activity) => onActivityChange(activity)}
          appConfig={appConfig}
          t={t}
          className={styles.paddingBottom}
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
                .filter((x) => !!x.journalpostId)
                .filter((x) => new Date(x.utgiftsperiode.tom) < new Date())
                .sort((a, b) => new Date(a.utgiftsperiode.fom).getTime() - new Date(b.utgiftsperiode.fom).getTime())
                .map((betalingsplan, index) =>
                  renderDrivingPeriodsFromActivities(betalingsplan, index, vedtak.trengerParkering),
                )}
            </Accordion>
            {alreadyRefunded.length > 0 && (
              <>
                <Heading size="small" spacing={true}>
                  {t(TEXTS.statiske.drivingList.previousDrivingList)}
                </Heading>
                <ul>
                  {vedtak?.betalingsplan
                    .filter((x) => !x.journalpostId)
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
