import { Accordion, Button, Radio, RadioGroup } from '@navikt/ds-react';
import { DrivingListSubmission, DrivingListValues, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { TFunction } from 'i18next';
import { useEffect } from 'react';
import {
  allFieldsForPeriodsAreSet,
  drivingListMetadata,
  generatePeriods,
  showAddButton,
  showRemoveButton,
  toDate,
} from '../../formio/components/core/driving-list/DrivingList.utils';
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
    if (allFieldsForPeriodsAreSet(values)) {
      const periods = generatePeriods(values!.selectedPeriodType!, values!.selectedDate, values!.periods!.length) ?? [];
      updateValues({ periods });
    }
  }, [updateValues, values]);

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
    if (!allFieldsForPeriodsAreSet(values)) return;
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
              toDate={toDate(values)}
              defaultMonth={toDate(values)}
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
        {allFieldsForPeriodsAreSet(values) && values!.periods!.length > 0 && (
          <div className={styles.buttonContainer}>
            {showAddButton(values) && (
              <Button variant="primary" size="small" type="button" onClick={() => addPeriod()}>
                {t(TEXTS.statiske.drivingList.addPeriod)}
              </Button>
            )}
            {showRemoveButton(values) && (
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
