import { Accordion, Button, Radio, RadioGroup } from '@navikt/ds-react';
import { DrivingListSubmission, DrivingListValues, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { TFunction } from 'i18next';
import { useEffect } from 'react';
import { drivingListMetadata, generatePeriods } from '../../formio/components/core/driving-list/DrivingList.utils';
import makeStyles from '../../util/styles/jss/jss';
import DatePicker from '../datepicker/DatePicker';
import DrivingPeriod from './DrivingPeriod';

type Props = {
  values?: DrivingListSubmission;
  t: TFunction;
  updateValues: (values: DrivingListValues) => void;
  locale: string;
};

const useDrivinglistStyles = makeStyles({
  marginBottom: {
    marginBottom: '2.5rem',
  },
  buttonContainer: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },
});

const DrivingListFromDates = ({ values, updateValues, t, locale }: Props) => {
  const styles = useDrivinglistStyles();

  useEffect(() => {
    if (allFieldsForPeriodsAreSet()) {
      const periods = generatePeriods(values!.selectedPeriodType!, values!.selectedDate, values!.periods!.length) ?? [];
      updateValues({ periods });
    }
  }, []);

  const allFieldsForPeriodsAreSet = () => {
    return (
      !!values?.selectedPeriodType &&
      !!values?.selectedDate &&
      !!values?.periods?.length &&
      values?.parking !== undefined &&
      values?.parking !== null
    );
  };

  const onDateChange = (date?: string) => {
    if (values?.selectedDate === date) return;

    if (values?.selectedPeriodType === 'weekly') {
      const periods = generatePeriods('weekly', date) ?? [];
      updateValues({ selectedDate: date, periods, dates: [] });
    } else if (values?.selectedPeriodType === 'monthly') {
      const periods = generatePeriods('monthly', date) ?? [];
      updateValues({ selectedDate: date, periods, dates: [] });
    } else if (date) {
      updateValues({ selectedDate: date });
    }
  };

  const onPeriodChange = (period: 'weekly' | 'monthly') => {
    if (values?.selectedPeriodType === period) return;
    const numberOfPeriods = 1;

    if (period === 'weekly') {
      const periods = generatePeriods('weekly', values?.selectedDate, numberOfPeriods) ?? [];
      updateValues({ selectedDate: values?.selectedDate, periods, selectedPeriodType: 'weekly', dates: [] });
    } else {
      const periods = generatePeriods('monthly', values?.selectedDate, numberOfPeriods) ?? [];
      updateValues({ selectedDate: values?.selectedDate, periods, selectedPeriodType: 'monthly', dates: [] });
    }
  };

  const onParkingChange = (parking: boolean) => {
    updateValues({ parking: parking });
  };

  const renderDrivingPeriodsFromDates = () => {
    if (!allFieldsForPeriodsAreSet()) return;
    return values?.periods
      ?.sort((a, b) => new Date(a.periodFrom).getTime() - new Date(b.periodFrom).getTime())
      .map((period, index) => (
        <DrivingPeriod
          t={t}
          index={index}
          key={period.id}
          hasParking={values?.parking ?? false}
          updateValues={updateValues}
          periodFrom={period.periodFrom}
          periodTo={period.periodTo}
          values={values}
          locale={locale}
        />
      ));
  };

  const addPeriod = () => {
    if (values?.selectedDate && values?.selectedPeriodType) {
      const periods = generatePeriods(
        values?.selectedPeriodType,
        values.selectedDate,
        (values.periods?.length ?? 0) + 1,
      );
      updateValues({ periods });
    }
  };

  const removePeriod = () => {
    if (values?.selectedDate && values?.selectedPeriodType) {
      const periods = generatePeriods(
        values?.selectedPeriodType,
        values?.selectedDate,
        (values?.periods?.length ?? 0) - 1,
      );

      // Filter out dates that fall within the removed periods
      const filteredDates = values?.dates?.filter((dateObj) => {
        const date = new Date(dateObj.date);
        return periods.some((period) => {
          return date >= new Date(period.periodFrom) && date <= new Date(period.periodTo);
        });
      });

      updateValues({ periods, dates: filteredDates });
    }
  };

  const showAddButton = () => {
    const lastPeriod = values?.periods?.reduce((prev, current) =>
      new Date(prev.periodTo) > new Date(current.periodTo) ? prev : current,
    );
    if (!lastPeriod) return false;

    const lastPeriodDate = new Date(lastPeriod.periodTo);

    if (values?.selectedPeriodType === 'weekly') {
      lastPeriodDate.setDate(lastPeriodDate.getDate() + 7);
    } else if (lastPeriod && values?.selectedPeriodType === 'monthly') {
      lastPeriodDate.setMonth(lastPeriodDate.getMonth() + 1);
    } else {
      return false;
    }

    return lastPeriodDate < new Date();
  };

  const showRemoveButton = () => {
    return values?.periods?.length && values?.periods?.length > 1;
  };

  const toDate = () => {
    const date = new Date();

    if (values?.selectedPeriodType === 'weekly') {
      date.setDate(date.getDate() - 6);
      return date;
    } else if (values?.selectedPeriodType === 'monthly') {
      date.setMonth(date.getMonth() - 1);
      return date;
    }
  };

  const renderDrivingListFromDates = () => {
    return (
      <>
        <RadioGroup
          id={drivingListMetadata('periodType').id}
          legend={t(drivingListMetadata('periodType').label)}
          onChange={(value) => onPeriodChange(value)}
          defaultValue={values?.selectedPeriodType}
          tabIndex={-1}
          className={styles.marginBottom}
        >
          <Radio value="weekly">{t(TEXTS.common.weekly)}</Radio>
          <Radio value="monthly">{t(TEXTS.common.monthly)}</Radio>
        </RadioGroup>
        {values?.selectedPeriodType && (
          <>
            <DatePicker
              id={drivingListMetadata('datePicker').id}
              label={t(drivingListMetadata('datePicker').label)}
              isRequired={true}
              value={values?.selectedDate}
              onChange={(date: string) => onDateChange(date)}
              locale={locale}
              readOnly={false}
              error={undefined}
              inputRef={undefined}
              className={styles.marginBottom}
              toDate={toDate()}
              defaultMonth={toDate()}
              description={t(drivingListMetadata('datePicker').description ?? '')}
            />
            <RadioGroup
              id={drivingListMetadata('parkingRadio').id}
              legend={t(drivingListMetadata('parkingRadio').label)}
              onChange={(value) => onParkingChange(value)}
              defaultValue={values?.parking}
              tabIndex={-1}
              className={styles.marginBottom}
            >
              <Radio value={true}>{t(TEXTS.common.yes)}</Radio>
              <Radio value={false}>{t(TEXTS.common.no)}</Radio>
            </RadioGroup>
          </>
        )}

        <Accordion tabIndex={-1} id={drivingListMetadata('dates').id} className={styles.marginBottom}>
          {renderDrivingPeriodsFromDates()}
        </Accordion>
        {allFieldsForPeriodsAreSet() && values!.periods!.length > 0 && (
          <div className={styles.buttonContainer}>
            {showAddButton() && (
              <Button variant="primary" size="small" type="button" onClick={() => addPeriod()}>
                {t(TEXTS.statiske.drivingList.addPeriod)}
              </Button>
            )}
            {showRemoveButton() && (
              <Button variant="secondary" size="small" type="button" onClick={() => removePeriod()}>
                {t(TEXTS.statiske.drivingList.removePeriod)}
              </Button>
            )}
          </div>
        )}
      </>
    );
  };

  return renderDrivingListFromDates();
};
export default DrivingListFromDates;
