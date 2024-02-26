import { Accordion, Alert, Heading, Radio, RadioGroup, Skeleton } from '@navikt/ds-react';
import { SendInnAktivitet } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getActivities } from '../../api/sendinn/sendInnActivities';
import { AppConfigContextType } from '../../context/config/configContext';
import { getComponentInfo } from '../../formio/components/core/driving-list/DrivingList.info';
import makeStyles from '../../util/styles/jss/jss';
import DatePicker from '../datepicker/DatePicker';
import DrivingPeriod from './DrivingPeriod';

interface NavDrivingListProps {
  onValueChange: (value: object) => void;
  appConfig: AppConfigContextType;
  values: DrivingListValues;
  t(text: string, params?: any): any;
  locale: string;
}

export interface DrivingListValues {
  selectedDate: string;
  selectedPeriodType?: 'weekly' | 'monthly';
  periods?: DrivingListPeriod[];
  parking?: boolean;
  dates: { date: string; parking: string }[];
}

interface DrivingListPeriod {
  periodFrom: Date;
  periodTo: Date;
  id: string;
}

const useDrivinglistStyles = makeStyles({
  accordion: {
    paddingBottom: '4rem',
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

  const updateValue = <K extends keyof DrivingListValues>(key: K, value: DrivingListValues[K]) => {
    onValueChange({ ...values, [key]: value });
  };

  const updateMultipleValues = (multipleValues: object) => {
    onValueChange({ ...values, ...multipleValues, dates: [] });
  };

  const onDateChange = (date?: string) => {
    if (values?.selectedDate === date) return;

    if (values?.selectedPeriodType === 'weekly') {
      const periods = generatePeriods('weekly', date) ?? [];
      updateMultipleValues({ selectedDate: date, periods });
    } else if (values?.selectedPeriodType === 'monthly') {
      const periods = generatePeriods('monthly', date) ?? [];
      updateMultipleValues({ selectedDate: date, periods });
    } else if (date) {
      updateValue('selectedDate', date);
    }
  };

  const onPeriodChange = (period: 'weekly' | 'monthly') => {
    if (period === 'weekly') {
      const periods = generatePeriods('weekly', values?.selectedDate) ?? [];
      updateMultipleValues({ selectedDate: values?.selectedDate, periods, selectedPeriodType: 'weekly' });
    } else {
      const periods = generatePeriods('monthly', values?.selectedDate) ?? [];
      updateMultipleValues({ selectedDate: values?.selectedDate, periods, selectedPeriodType: 'monthly' });
    }
  };

  const onParkingChange = (parking: boolean) => {
    updateValue('parking', parking);
  };

  const renderDrivingListFromActivities = () => {
    // FIXME: Get the correct data here
    const activity = activities[0];
    const vedtak = activity?.saksinformasjon?.vedtaksinformasjon?.[0];

    return (
      <>
        <Heading size="medium" spacing={true}>
          {t('Legg til kjøreliste')}
        </Heading>
        <Accordion id={getComponentInfo('dates').id} className={styles.accordion}>
          {vedtak?.betalingsplan
            .filter((x) => !!x.journalpostId)
            .map((betalingsplan, index) => {
              const periodFrom = new Date(betalingsplan.utgiftsperiode.fom);
              const periodTo = new Date(betalingsplan.utgiftsperiode.tom);

              return (
                <DrivingPeriod
                  t={t}
                  index={index}
                  hasParking={vedtak.trengerParkering}
                  onValueChange={onValueChange}
                  key={betalingsplan.betalingsplanId}
                  periodFrom={periodFrom}
                  periodTo={periodTo}
                  values={values}
                />
              );
            })}
        </Accordion>
        <Heading size="medium" spacing={true}>
          {t('Perioder du tidligere har fått refundert reiseutgifter for')}
        </Heading>
        <Accordion className={styles.accordion}>
          {vedtak?.betalingsplan
            .filter((x) => !x.journalpostId)
            .map((betalingsplan, index) => {
              const periodFrom = new Date(betalingsplan.utgiftsperiode.fom);
              const periodTo = new Date(betalingsplan.utgiftsperiode.tom);

              return (
                <DrivingPeriod
                  t={t}
                  index={index}
                  hasParking={vedtak.trengerParkering}
                  onValueChange={onValueChange}
                  key={betalingsplan.betalingsplanId}
                  periodFrom={periodFrom}
                  periodTo={periodTo}
                  values={values}
                  readOnly={true}
                />
              );
            })}
        </Accordion>
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
    return (
      <Alert variant="info">
        {t(
          'Du har ikke vedtak om stønad til daglig reise med bruk av egen bil. Det er ikke registrert vedtak om tilleggsstønad på deg. Du må søke om tilleggsstønad og motta vedtak før du kan sende inn liste over utgifter til daglig reise med bruk av egen bil.',
        )}
      </Alert>
    );
  };

  const isLoggedInWithActivities = isLoggedIn && activities.length > 0;
  const isLoggedInWithoutActivities = isLoggedIn && activities.length === 0;

  const renderDrivingList = () => {
    if (loading) {
      return <Skeleton variant="rounded" width="100%" height={150} />;
    }

    if (showError && submissionMethod === 'digital') {
      return <Alert variant="error">{t('Det oppstod en feil ved henting av aktiviteter')}</Alert>;
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
