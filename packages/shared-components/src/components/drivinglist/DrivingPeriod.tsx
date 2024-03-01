import { Accordion, Alert, Checkbox, CheckboxGroup, TextField } from '@navikt/ds-react';
import { DrivingListSubmission, DrivingListValues, TEXTS, dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { TFunction } from 'i18next';
import { useMemo } from 'react';
import {
  drivingListMetadata,
  toLocaleDate,
  toWeekdayAndDate,
} from '../../formio/components/core/driving-list/DrivingList.utils';
import makeStyles from '../../util/styles/jss/jss';

interface DrivingPeriodProps {
  periodFrom: Date;
  periodTo: Date;
  updateValues: (values: DrivingListValues) => void;
  hasParking: boolean;
  values?: DrivingListSubmission;
  t: TFunction;
  index: number;
  refundAmount?: number;
  dailyRate?: number;
  betalingsplanId?: string;
}

const useDrivingPeriodStyles = makeStyles({
  parkingTextField: {
    marginBottom: '1rem',
  },
});

const DrivingPeriod = ({
  periodFrom,
  periodTo,
  updateValues,
  values,
  hasParking,
  t,
  refundAmount,
  dailyRate,
  betalingsplanId,
}: DrivingPeriodProps) => {
  const styles = useDrivingPeriodStyles();

  const periodDates = useMemo(() => dateUtils.getDatesInRange(periodFrom, periodTo), [periodFrom, periodTo]);
  const selectedDates = values?.dates?.map((value) => value.date);
  const header = `${toLocaleDate(periodFrom)} - ${toLocaleDate(periodTo)}`;

  const showParking = (date: string) => {
    if (selectedDates?.includes(date) && !!hasParking) {
      return true;
    }
    return false;
  };

  const onChange = (checkBoxValues: string[]) => {
    const mappedValues = checkBoxValues.map((newValue) => {
      const existingValue = values?.dates?.find((val) => val.date === newValue);
      const parking = existingValue ? existingValue.parking : '';
      return { date: newValue, parking, betalingsplanId };
    });

    updateValues({ dates: mappedValues });
  };

  const onChangeParking = (date: Date, parking: string) => {
    const mappedValues = values?.dates?.map((existingValue) => {
      if (existingValue.date === date.toISOString()) {
        return { date: existingValue.date, parking, betalingsplanId };
      }
      return existingValue;
    });

    updateValues({ dates: mappedValues });
  };

  const renderWarningAlert = () => {
    return <Alert variant="warning">{t(TEXTS.statiske.drivingList.expensesTooHigh)}</Alert>;
  };

  const shouldRenderExpensesWarningAlert = () => {
    if (refundAmount) {
      const totalParking = periodDates.reduce((acc, currentDate) => {
        const dateInValues = values?.dates.find((date) => date.date === currentDate.toISOString());
        if (dateInValues) {
          return acc + Number(dateInValues.parking);
        }
        return acc;
      }, 0);

      const totalDailyRate = periodDates.reduce((acc, currentDate) => {
        const dateInValues = values?.dates.find((date) => date.date === currentDate.toISOString());
        if (dateInValues && dailyRate) {
          return acc + dailyRate;
        }
        return acc;
      }, 0);

      return totalParking + totalDailyRate > refundAmount;
    }
    return false;
  };

  return (
    <Accordion.Item>
      <Accordion.Header>{header}</Accordion.Header>
      <Accordion.Content>
        <CheckboxGroup
          legend={t(drivingListMetadata('dates').label)}
          onChange={(values) => onChange(values)}
          value={values?.dates?.map((value) => value.date) ?? []}
        >
          {periodDates.map((date) => {
            return (
              <div key={date.toISOString()}>
                <Checkbox value={date.toISOString()}>{toWeekdayAndDate(date)}</Checkbox>
                {showParking(date.toISOString()) ? (
                  <TextField
                    id={drivingListMetadata('parkingExpenses').id}
                    label={t(drivingListMetadata('parkingExpenses').label)}
                    type="text"
                    size="medium"
                    inputMode="numeric"
                    className={`nav-input--s ${styles.parkingTextField}`}
                    value={values?.dates?.find((val) => val.date === date.toISOString())?.parking}
                    onChange={(event) => onChangeParking(date, event.currentTarget.value)}
                  />
                ) : null}
              </div>
            );
          })}
        </CheckboxGroup>
        {shouldRenderExpensesWarningAlert() ? renderWarningAlert() : null}
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default DrivingPeriod;
