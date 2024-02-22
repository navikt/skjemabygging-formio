import { Accordion, Checkbox, CheckboxGroup, TextField } from '@navikt/ds-react';
import { dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { getComponentInfo } from '../../formio/components/core/driving-list/DrivingList.info';
import { DrivingListValues } from './NavDrivingList';

interface DrivingPeriodProps {
  periodFrom: Date;
  periodTo: Date;
  onValueChange: (value: any) => void;
  hasParking: boolean;
  values?: DrivingListValues;
  t: (text: string, params?: any) => any;
}

const DrivingPeriod = ({ periodFrom, periodTo, onValueChange, values, hasParking, t }: DrivingPeriodProps) => {
  const periodDates = useMemo(() => dateUtils.getDatesInRange(periodFrom, periodTo), [periodFrom, periodTo]);
  const selectedDates = values?.dates?.map((value) => value.date);

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
      return { date: newValue, parking };
    });

    onValueChange({ ...values, dates: mappedValues });
  };

  const onChangeParking = (date: Date, parking: string) => {
    const mappedValues = values?.dates?.map((existingValue) => {
      if (existingValue.date === toLocaleDate(date)) {
        return { date: existingValue.date, parking };
      }
      return existingValue;
    });

    onValueChange({ ...values, dates: mappedValues });
  };

  const toLocaleDate = (date: Date) => {
    return dateUtils.toLocaleDate(date.toString());
  };

  const toWeekdayAndDate = (date: Date) => {
    return dateUtils.toWeekdayAndDate(date.toString());
  };

  const header = `${toLocaleDate(periodFrom)} - ${toLocaleDate(periodTo)}`;

  // FIXME: Fix validation on number and input size
  return (
    <Accordion.Item>
      <Accordion.Header>{header}</Accordion.Header>
      <Accordion.Content>
        <CheckboxGroup
          id={getComponentInfo('dates').id}
          legend={t(getComponentInfo('dates').label)}
          onChange={(values) => onChange(values)}
          value={values?.dates?.map((value) => value.date) ?? []}
        >
          {periodDates.map((date) => {
            return (
              <div key={date.toISOString()}>
                <Checkbox value={toLocaleDate(date)}>{toWeekdayAndDate(date)}</Checkbox>
                {showParking(toLocaleDate(date)) ? (
                  <TextField
                    id={getComponentInfo('parkingExpenses').id}
                    label={t(getComponentInfo('parkingExpenses').label)}
                    type="text"
                    size="medium"
                    inputMode="numeric"
                    className="nav-input--s"
                    pattern="[0-9]*"
                    value={values?.dates?.find((val) => val.date === toLocaleDate(date))?.parking}
                    onChange={(event) => onChangeParking(date, event.currentTarget.value)}
                  />
                ) : null}
              </div>
            );
          })}
        </CheckboxGroup>
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default DrivingPeriod;