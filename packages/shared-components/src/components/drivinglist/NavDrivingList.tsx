import { Accordion, Alert, BodyShort, Heading, Radio, RadioGroup, Skeleton } from '@navikt/ds-react';
import { SendInnAktivitet, SubmissionActivity, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { AktivitetVedtaksinformasjon, VedtakBetalingsplan } from '../../../../shared-domain/src/sendinn/activity';
import { getActivities } from '../../api/sendinn/sendInnActivities';
import { AppConfigContextType } from '../../context/config/configContext';
import { getComponentInfo, toLocaleDate } from '../../formio/components/core/driving-list/DrivingList.utils';
import makeStyles from '../../util/styles/jss/jss';
import NavActivities from '../activities/NavActivities';
import DatePicker from '../datepicker/DatePicker';
import DrivingPeriod from './DrivingPeriod';

interface NavDrivingListProps {
  onValueChange: (value: object) => void;
  appConfig: AppConfigContextType;
  values: DrivingListSubmission;
  t(text: string, params?: any): any;
  locale: string;
}

export interface DrivingListSubmission {
  selectedDate: string;
  selectedPeriodType?: 'weekly' | 'monthly';
  periods?: DrivingListPeriod[];
  parking?: boolean;
  dates: { date: string; parking: string }[];
  selectedActivity?: string;
}

interface DrivingListPeriod {
  periodFrom: Date;
  periodTo: Date;
  id: string;
}

const useDrivinglistStyles = makeStyles({
  heading: {
    paddingTop: '1rem',
  },
  accordion: {
    paddingTop: '2rem',
    paddingBottom: '2rem',
  },
});

const NavDrivingList = ({ appConfig, onValueChange, values, t, locale }: NavDrivingListProps) => {
  const [activities, setActivities] = useState<SendInnAktivitet[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showError, setShowError] = useState<boolean>(false);
  const styles = useDrivinglistStyles();

  const submissionMethod = appConfig?.submissionMethod;
  const isLoggedIn = appConfig?.config?.isLoggedIn;
  const app = appConfig?.app;

  useEffect(() => {
    const fetchData = async () => {
      if (app === 'fyllut' && isLoggedIn) {
        try {
          setLoading(true);
          const result = await getActivities(appConfig);
          setLoading(false);

          if (result) {
            setActivities(result);
          }
        } catch (ex) {
          setLoading(false);
          setShowError(true);
        }
      } else {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const generatePeriods = (periodType: 'weekly' | 'monthly', date?: string): DrivingListPeriod[] => {
    if (!date) return [];

    const startDate = new Date(date);
    const endDate = new Date(date);

    if (periodType === 'weekly') {
      endDate.setDate(endDate.getDate() + 6);
    } else if (periodType === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    }
    return [{ periodFrom: startDate, periodTo: endDate, id: uuidv4() }];
  };

  const updateValue = (key: keyof DrivingListSubmission, value: DrivingListSubmission[keyof DrivingListSubmission]) => {
    onValueChange({ ...values, [key]: value });
  };

  const updateMultipleValues = (
    multipleValues: Partial<Record<keyof DrivingListSubmission, DrivingListSubmission[keyof DrivingListSubmission]>>,
  ) => {
    onValueChange({ ...values, ...multipleValues });
  };

  const onDateChange = (date?: string) => {
    if (values?.selectedDate === date) return;

    if (values?.selectedPeriodType === 'weekly') {
      const periods = generatePeriods('weekly', date) ?? [];
      updateMultipleValues({ selectedDate: date, periods, dates: [] });
    } else if (values?.selectedPeriodType === 'monthly') {
      const periods = generatePeriods('monthly', date) ?? [];
      updateMultipleValues({ selectedDate: date, periods, dates: [] });
    } else if (date) {
      updateValue('selectedDate', date);
    }
  };

  const onPeriodChange = (period: 'weekly' | 'monthly') => {
    if (period === 'weekly') {
      const periods = generatePeriods('weekly', values?.selectedDate) ?? [];
      updateMultipleValues({ selectedDate: values?.selectedDate, periods, selectedPeriodType: 'weekly', dates: [] });
    } else {
      const periods = generatePeriods('monthly', values?.selectedDate) ?? [];
      updateMultipleValues({ selectedDate: values?.selectedDate, periods, selectedPeriodType: 'monthly', dates: [] });
    }
  };

  const onParkingChange = (parking: boolean) => {
    updateValue('parking', parking);
  };

  const onActivityChange = (activity?: SendInnAktivitet | SubmissionActivity) => {
    updateMultipleValues({ selectedActivity: activity?.aktivitetId, dates: [] });
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
        onValueChange={onValueChange}
        key={betalingsplan.betalingsplanId}
        periodFrom={periodFrom}
        periodTo={periodTo}
        values={values}
        readOnly={!betalingsplan.journalpostId}
      />
    );
  };

  const renderActivityAlert = (activityName: string, vedtak: AktivitetVedtaksinformasjon) => {
    const vedtakPeriodFrom = new Date(vedtak.periode.fom);
    const vedtakPeriodTo = new Date(vedtak.periode.tom);

    return (
      <Alert variant={'info'}>
        {
          <>
            <Heading size="xsmall">{'Aktivitet'}</Heading>
            <BodyShort size="medium" spacing={true}>
              {activityName}
            </BodyShort>

            <Heading size="xsmall">{'Periode for aktiviteten'}</Heading>
            <BodyShort size="medium" spacing={true}>{`${toLocaleDate(vedtakPeriodFrom)} - ${toLocaleDate(
              vedtakPeriodTo,
            )}`}</BodyShort>

            <Heading size="xsmall">{'Din dagsats uten parkeringsutgift'}</Heading>
            <BodyShort size="medium" spacing={true}>
              {vedtak.dagsats}
            </BodyShort>
          </>
        }
      </Alert>
    );
  };

  const renderDrivingListFromActivities = () => {
    const activity = activities.find((x) => x.aktivitetId === values?.selectedActivity);
    const vedtak = activity?.saksinformasjon?.vedtaksinformasjon?.[0];
    const alreadyRefunded = vedtak?.betalingsplan.filter((x) => !x.journalpostId) ?? [];

    return (
      <>
        <NavActivities
          id={getComponentInfo('activityRadio').id}
          label={t(getComponentInfo('activityRadio').label)}
          value={activity}
          onChange={(activity) => onActivityChange(activity)}
          appConfig={appConfig}
          t={t}
        />
        {activity && vedtak && (
          <>
            {renderActivityAlert(activity.aktivitetsnavn, vedtak)}
            <Accordion id={getComponentInfo('dates').id} className={styles.accordion} size="small">
              {vedtak?.betalingsplan
                .filter((x) => !!x.journalpostId)
                .map((betalingsplan, index) =>
                  renderDrivingPeriodsFromActivities(betalingsplan, index, vedtak.trengerParkering),
                )}
            </Accordion>
            {alreadyRefunded.length > 0 && (
              <>
                <Heading size="small" spacing={true}>
                  {t('Perioder du tidligere har fått refundert reiseutgifter for')}
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

  // FIXME: Should be able to add/remove periods
  const renderDrivingPeriodsFromDates = () => {
    return values?.periods?.map((period, index) => (
      <DrivingPeriod
        t={t}
        index={index}
        key={period.id}
        hasParking={values?.parking ?? false}
        onValueChange={onValueChange}
        periodFrom={period.periodFrom}
        periodTo={period.periodTo}
        values={values}
      />
    ));
  };

  const renderDrivingListFromDates = () => {
    return (
      <>
        <DatePicker
          id={getComponentInfo('datePicker').id}
          label={t(getComponentInfo('datePicker').label)}
          isRequired={true}
          value={values?.selectedDate}
          onChange={(date: string) => onDateChange(date)}
          locale={locale}
          readOnly={false}
          error={undefined}
          inputRef={undefined}
        />
        <RadioGroup
          id={getComponentInfo('periodType').id}
          legend={t(getComponentInfo('periodType').label)}
          onChange={(value) => onPeriodChange(value)}
          defaultValue={values?.selectedPeriodType}
        >
          <Radio value="weekly">{t('Ukentlig')}</Radio>
          <Radio value="monthly">{t('Månedlig')}</Radio>
        </RadioGroup>
        <RadioGroup
          id={getComponentInfo('parkingRadio').id}
          legend={t(getComponentInfo('parkingRadio').label)}
          onChange={(value) => onParkingChange(value)}
          defaultValue={values?.parking}
        >
          <Radio value={true}>{t('Ja')}</Radio>
          <Radio value={false}>{t('Nei')}</Radio>
        </RadioGroup>
        <Accordion id={getComponentInfo('dates').id}>{renderDrivingPeriodsFromDates()}</Accordion>
      </>
    );
  };

  const renderNoActivitiesAlert = () => {
    return <Alert variant="info">{t(TEXTS.statiske.activities.noVedtak)}</Alert>;
  };

  const isLoggedInWithActivities = isLoggedIn && activities.length > 0;
  const isLoggedInWithoutActivities = isLoggedIn && activities.length === 0;

  const renderDrivingList = () => {
    if (loading) {
      return <Skeleton variant="rounded" width="100%" height={150} />;
    }

    if (showError && submissionMethod === 'digital') {
      return <Alert variant="error">{t(TEXTS.statiske.activities.error)}</Alert>;
    }

    if (isLoggedInWithoutActivities && submissionMethod === 'paper') {
      return renderDrivingListFromDates();
    }

    if (isLoggedInWithoutActivities && submissionMethod === 'digital') {
      return renderNoActivitiesAlert();
    }

    if (!isLoggedIn && submissionMethod === 'paper') {
      return renderDrivingListFromDates();
    }

    if (isLoggedInWithActivities && submissionMethod === 'digital') {
      return renderDrivingListFromActivities();
    }

    return renderDrivingListFromDates();
  };

  return renderDrivingList();
};

export default NavDrivingList;
