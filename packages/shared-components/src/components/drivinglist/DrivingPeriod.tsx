import { Accordion, Alert, BodyShort, Checkbox, CheckboxGroup, Heading, TextField } from '@navikt/ds-react';
import { TEXTS, VedtakBetalingsplan, dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { useComponentUtils } from '../../context/component/componentUtilsContext';
import { drivingListMetadata } from '../../formio/components/core/driving-list/DrivingList.utils';
import { useDrivingList } from '../../formio/components/core/driving-list/DrivingListContext';
import makeStyles from '../../util/styles/jss/jss';

interface DrivingPeriodProps {
  periodFrom: string;
  periodTo: string;
  hasParking: boolean;
  index: number;
  dailyRate?: number;
  betalingsplan?: VedtakBetalingsplan;
}

const useDrivingPeriodStyles = makeStyles({
  parkingTextField: {
    marginBottom: '1rem',
  },
});

const DrivingPeriod = ({ periodFrom, periodTo, hasParking, dailyRate, betalingsplan }: DrivingPeriodProps) => {
  const { values, updateValues, getComponentError } = useDrivingList();
  const { translate, locale, addRef } = useComponentUtils();

  const styles = useDrivingPeriodStyles();

  const periodDates = useMemo(() => dateUtils.getDatesInRange(periodFrom, periodTo), [periodFrom, periodTo]);
  const selectedDates = values?.dates?.map((value) => value.date);
  const header = `${dateUtils.toLocaleDateLongMonth(periodFrom, locale)} - ${dateUtils.toLocaleDateLongMonth(periodTo, locale)}`;

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
      const betalingsplanId = existingValue ? existingValue.betalingsplanId : betalingsplan?.betalingsplanId;
      return { date: newValue, parking, betalingsplanId };
    });

    updateValues({ dates: mappedValues });
  };

  const onChangeParking = (date: string, parking: string) => {
    const mappedValues = values?.dates?.map((existingValue) => {
      if (existingValue.date === date) {
        return { date: existingValue.date, parking: parking.trim(), betalingsplanId: existingValue.betalingsplanId };
      }
      return existingValue;
    });

    updateValues({ dates: mappedValues });
  };

  const renderWarningAlert = () => {
    return (
      <Alert variant="warning">
        <Heading size="xsmall">{translate(TEXTS.statiske.drivingList.expensesTooHighHeader)}</Heading>
        <BodyShort>{translate(TEXTS.statiske.drivingList.expensesTooHigh)}</BodyShort>
      </Alert>
    );
  };

  // Should render warning if the sum of all parking expenses + sum of daily rates is higher than the refund amount for the period
  const shouldRenderExpensesWarningAlert = () => {
    if (betalingsplan?.beloep) {
      const totalParking = periodDates.reduce((acc, currentDate) => {
        const dateInValues = values?.dates?.find((date) => date.date === currentDate);
        if (dateInValues) {
          return acc + Number(dateInValues.parking);
        }
        return acc;
      }, 0);

      const totalDailyRate = periodDates.reduce((acc, currentDate) => {
        const dateInValues = values?.dates?.find((date) => date.date === currentDate);
        if (dateInValues && dailyRate) {
          return acc + dailyRate;
        }
        return acc;
      }, 0);

      return totalParking + totalDailyRate > betalingsplan.beloep;
    }
    return false;
  };

  const drivingListLegend = () => {
    if (values?.parking === true || hasParking === true) {
      return (
        translate(drivingListMetadata('dates').label) + ' ' + translate(TEXTS.statiske.drivingList.dateSelectParking)
      );
    }
    return translate(drivingListMetadata('dates').label);
  };

  return (
    <Accordion.Item>
      <Accordion.Header>{header}</Accordion.Header>
      <Accordion.Content>
        <CheckboxGroup
          legend={drivingListLegend()}
          onChange={(values) => onChange(values)}
          value={values?.dates?.map((value) => value.date) ?? []}
          error={getComponentError('dates')}
        >
          {periodDates.map((date) => {
            return (
              <div key={date}>
                <Checkbox value={date}>{dateUtils.toWeekdayAndDate(date, locale)}</Checkbox>
                {showParking(date) ? (
                  <TextField
                    label={translate(drivingListMetadata('parkingExpenses').label)}
                    type="text"
                    size="medium"
                    inputMode="numeric"
                    className={`nav-input--s ${styles.parkingTextField}`}
                    value={values?.dates?.find((val) => val.date === date)?.parking}
                    onChange={(event) => onChangeParking(date, event.currentTarget.value)}
                    ref={(ref) => addRef(`dates:${date}:parking`, ref)}
                    error={getComponentError(`dates:${date}:parking`)}
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
