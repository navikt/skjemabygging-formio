import { Accordion, BodyShort, Heading } from '@navikt/ds-react';
import { TEXTS, VedtakBetalingsplan, dateUtils } from '@navikt/skjemadigitalisering-shared-domain';
import { useMemo } from 'react';
import { useLanguage } from '../../context/language/LanguageContext';
import { useStateField } from '../../context/state/useStateField';
import { useSubmissionMethod } from '../../context/submission-method/SubmissionMethodContext';
import Alert from '../alert/Alert';
import CheckboxGroup from '../checkbox-group/CheckboxGroup';
import DrivingListParkingExpense from './DrivingListParkingExpense';
import {
  getParkingFieldPath,
  getSelectedDatesForPeriod,
  mergePeriodDates,
  shouldShowExpenseWarning,
} from './drivingListUtils';

interface DrivingListPeriodProps {
  statePath: string;
  periodFrom: string;
  periodTo: string;
  hasParking: boolean;
  dailyRate?: number;
  betalingsplan?: VedtakBetalingsplan;
}

type DrivingListValue = {
  dates?: {
    date: string;
    parking: string;
    betalingsplanId?: string;
  }[];
};

const DrivingListPeriod = ({
  statePath,
  periodFrom,
  periodTo,
  hasParking,
  dailyRate,
  betalingsplan,
}: DrivingListPeriodProps) => {
  const { translate, currentLanguage } = useLanguage();
  const { submissionMethod } = useSubmissionMethod();
  const { stateValue, setStateValue } = useStateField({ statePath });
  const value = (stateValue as DrivingListValue | undefined) ?? {};
  const dates = value.dates ?? [];
  const periodDates = useMemo(() => dateUtils.getDatesInRange(periodFrom, periodTo), [periodFrom, periodTo]);
  const selectedDates = getSelectedDatesForPeriod(dates, periodDates);
  // The days are one answer split across the period accordions, so the group is given every picked
  // day - it only offers the ones inside its own period - and validates the whole answer.
  const allSelectedDates = dates.map((item) => item.date);
  const selectedDateEntries = dates.filter((item) => periodDates.includes(item.date));
  const header = `${dateUtils.toLocaleDateLongMonth(periodFrom, currentLanguage)} - ${dateUtils.toLocaleDateLongMonth(
    periodTo,
    currentLanguage,
  )}`;
  const legend = hasParking
    ? `${translate(TEXTS.statiske.drivingList.dateSelect)} ${translate(TEXTS.statiske.drivingList.dateSelectParking)}`
    : translate(TEXTS.statiske.drivingList.dateSelect);

  const updateDates = (nextDates: string[]) => {
    setStateValue({
      ...value,
      dates: mergePeriodDates(dates, nextDates, periodDates, betalingsplan?.betalingsplanId),
    });
  };

  return (
    <Accordion.Item>
      <Accordion.Header>{header}</Accordion.Header>
      <Accordion.Content>
        <CheckboxGroup
          statePath={`${statePath}.dates`}
          legend={legend}
          values={periodDates.map((date) => ({
            value: date,
            label: dateUtils.toWeekdayAndDate(date, currentLanguage),
          }))}
          value={allSelectedDates}
          onChange={updateDates}
          required
        >
          {hasParking &&
            selectedDates.map((date) => (
              <DrivingListParkingExpense
                key={date}
                statePath={getParkingFieldPath(statePath, dates, date)}
                date={date}
                enforceMaxHundred={submissionMethod === 'digital'}
              />
            ))}
        </CheckboxGroup>

        {shouldShowExpenseWarning(selectedDateEntries, dailyRate, betalingsplan?.beloep) && (
          <Alert variant="warning">
            <Heading size="xsmall" spacing>
              {translate(TEXTS.statiske.drivingList.expensesTooHighHeader)}
            </Heading>
            <BodyShort>{translate(TEXTS.statiske.drivingList.expensesTooHigh)}</BodyShort>
          </Alert>
        )}
      </Accordion.Content>
    </Accordion.Item>
  );
};

export default DrivingListPeriod;
export type { DrivingListPeriodProps };
