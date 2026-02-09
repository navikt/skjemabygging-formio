import { Accordion, Button, Heading, Radio, RadioGroup } from '@navikt/ds-react';
import { TEXTS, dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useMemo } from 'react';
import { useComponentUtils } from '../../context/component/componentUtilsContext';
import {
  allFieldsForPeriodsAreSet,
  drivingListMetadata,
  showAddButton,
  showRemoveButton,
} from '../../formio/components/core/driving-list/DrivingList.utils';
import { useDrivingList } from '../../formio/components/core/driving-list/DrivingListContext';
import makeStyles from '../../util/styles/jss/jss';
import DatePicker from '../datepicker/DatePicker';
import DrivingPeriod from './DrivingPeriod';

const useDrivinglistStyles = makeStyles({
  buttonContainer: {
    display: 'flex',
    gap: 'var(--ax-space-16)',
  },
  accoridonHeader: {
    marginBottom: 'var(--ax-space-8)',
  },
});

const DrivingListFromDates = () => {
  const { values, updateValues } = useDrivingList();
  const { translate, addRef, getComponentError } = useComponentUtils();

  const styles = useDrivinglistStyles();

  const allPeriodFieldsSet = useMemo(() => allFieldsForPeriodsAreSet(values), [values]);

  // Generate periods when coming from summary page
  useEffect(() => {
    if (allPeriodFieldsSet) {
      const periods = dateUtils.generateWeeklyPeriods(values?.selectedDate, values?.periods?.length) ?? [];
      updateValues({ periods });
    }
  }, [allPeriodFieldsSet, updateValues, values?.periods?.length, values?.selectedDate]);

  const onDateChange = (date?: string) => {
    if (values?.selectedDate === date) return;
    if (!date) return;

    const periods = dateUtils.generateWeeklyPeriods(date) ?? [];
    updateValues({ selectedDate: date, periods, dates: [] });
  };

  const onParkingChange = (parking: boolean) => {
    updateValues({ parking: parking });
  };

  const renderDrivingPeriodsFromDates = () =>
    values?.periods
      ?.sort((a, b) => new Date(a.periodFrom).getTime() - new Date(b.periodFrom).getTime())
      .map((period, index) => (
        <DrivingPeriod
          index={index}
          key={period.id}
          hasParking={values?.parking ?? false}
          periodFrom={period.periodFrom}
          periodTo={period.periodTo}
        />
      ));

  const addPeriod = () => {
    if (values?.selectedDate) {
      const periods = dateUtils.generateWeeklyPeriods(values.selectedDate, (values.periods?.length ?? 0) + 1);
      updateValues({ periods });
    }
  };

  const removePeriod = () => {
    if (values?.selectedDate && values) {
      const periods = dateUtils.generateWeeklyPeriods(values?.selectedDate, (values?.periods?.length ?? 0) - 1);

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
        <DatePicker
          id={drivingListMetadata('datePicker').id}
          label={translate(drivingListMetadata('datePicker').label)}
          required={true}
          value={values?.selectedDate}
          onChange={(date: string) => onDateChange(date)}
          readOnly={false}
          error={getComponentError('datePicker')}
          inputRef={(ref) => addRef(drivingListMetadata('datePicker').id, ref)}
          className={'mb'}
          toDate={dateUtils.toSubmissionDate()}
          defaultMonth={dateUtils.toSubmissionDate()}
          description={translate(drivingListMetadata('datePicker').description ?? '')}
        />
        <RadioGroup
          id={drivingListMetadata('parkingRadio').id}
          legend={translate(drivingListMetadata('parkingRadio').label)}
          error={getComponentError('parkingRadio')}
          onChange={(value) => onParkingChange(value)}
          defaultValue={values?.parking}
          tabIndex={-1}
          ref={(ref) => addRef(drivingListMetadata('parkingRadio').id, ref)}
          className={'mb'}
        >
          <Radio value={true}>{translate(TEXTS.common.yes)}</Radio>
          <Radio value={false}>{translate(TEXTS.common.no)}</Radio>
        </RadioGroup>

        {allPeriodFieldsSet && (
          <>
            <Heading size="xsmall" className={styles.accoridonHeader}>
              {TEXTS.statiske.drivingList.accordionHeader}
            </Heading>
            <Accordion
              tabIndex={-1}
              id={drivingListMetadata('dates').id}
              className={'mb'}
              ref={(ref) => addRef('dates', ref)}
            >
              {renderDrivingPeriodsFromDates()}
            </Accordion>

            <div className={styles.buttonContainer}>
              {showAddButton(values) && (
                <Button variant="secondary" size="small" type="button" onClick={() => addPeriod()}>
                  {translate(TEXTS.statiske.drivingList.addPeriod)}
                </Button>
              )}
              {showRemoveButton(values) && (
                <Button variant="secondary" size="small" type="button" onClick={() => removePeriod()}>
                  {translate(TEXTS.statiske.drivingList.removePeriod)}
                </Button>
              )}
            </div>
          </>
        )}
      </>
    );
  };

  return renderDrivingListFromDates();
};
export default DrivingListFromDates;
