import { Accordion, Radio, RadioGroup } from '@navikt/ds-react';
import { SendInnAktivitet } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getActivities } from '../../api/sendinn/sendInnActivities';
import DatePicker from '../datepicker/DatePicker';
import DrivingPeriod from './DrivingPeriod';

interface NavDrivingListProps {
  onValueChange: (value: any) => void;
  appConfig: any;
  values: DrivingListValues;
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

const NavDrivingList = ({ appConfig, onValueChange, values }: NavDrivingListProps) => {
  const [activities, setActivities] = useState<SendInnAktivitet[]>([]);

  // FIXME: Get the correct submission method here
  const submissionMethod = 'paper';

  useEffect(() => {
    const fetchData = async () => {
      // FIXME: Update if statement
      if (appConfig?.app === 'fyllut' && submissionMethod !== 'paper') {
        const result = await getActivities(appConfig);

        if (result) {
          setActivities(result);
        }
      }
    };

    fetchData();
  }, []);

  const generatePeriods = (periodType: 'weekly' | 'monthly', date?: string) => {
    if (!date) return;

    const drivingListPeriods: DrivingListPeriod[] = [];
    const startDate = new Date(date);
    const endDate = new Date(date);

    if (periodType === 'weekly') {
      endDate.setDate(endDate.getDate() + 6);
    } else if (periodType === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    drivingListPeriods.push({ periodFrom: startDate, periodTo: endDate, id: uuidv4() });

    return drivingListPeriods;
  };

  const updateValues = <K extends keyof DrivingListValues>(key: K, value: DrivingListValues[K]) => {
    onValueChange({ ...values, [key]: value });
  };

  const onDateChange = (date?: string) => {
    console.log(date);
    if (values?.selectedDate === date) return;
    if (values?.selectedPeriodType === 'weekly') {
      onValueChange({
        ...values,
        selectedDate: date,
        selectedPeriodType: 'weekly',
        periods: generatePeriods('weekly', date) ?? [],
        dates: [],
      });
    } else if (values?.selectedPeriodType === 'monthly') {
      onValueChange({
        ...values,
        selectedDate: date,
        selectedPeriodType: 'monthly',
        periods: generatePeriods('monthly', date) ?? [],
        dates: [],
      });
    } else if (date) {
      updateValues('selectedDate', date);
    }
  };

  const onPeriodChange = (period: 'weekly' | 'monthly') => {
    if (period === 'weekly') {
      onValueChange({
        ...values,
        selectedPeriodType: 'weekly',
        periods: generatePeriods('weekly', values?.selectedDate) ?? [],
        dates: [],
      });
    } else {
      onValueChange({
        ...values,
        selectedPeriodType: 'monthly',
        periods: generatePeriods('monthly', values?.selectedDate) ?? [],
        dates: [],
      });
    }
  };

  const onParkingChange = (parking: boolean) => {
    updateValues('parking', parking);
  };

  const renderDigitalDrivingList = () => {
    // FIXME: Get the correct data here
    const activity = activities[0];
    const vedtak = activity?.saksinformasjon?.vedtaksinformasjon?.[0];

    return (
      <Accordion>
        {vedtak?.betalingsplan.map((betalingsplan) => {
          const periodFrom = new Date(betalingsplan.utgiftsperiode.fom);
          const periodTo = new Date(betalingsplan.utgiftsperiode.tom);

          return (
            <DrivingPeriod
              hasParking={vedtak.trengerParkering}
              onValueChange={onValueChange}
              id={betalingsplan.betalingsplanId}
              key={betalingsplan.betalingsplanId}
              periodFrom={periodFrom}
              periodTo={periodTo}
              values={values}
            />
          );
        })}
      </Accordion>
    );
  };

  // FIXME: Should be able to add/remove periods
  const renderPaperDrivingList = () => {
    return values?.periods?.map((period) => {
      return (
        <DrivingPeriod
          key={period.id}
          hasParking={values?.parking ?? false}
          onValueChange={onValueChange}
          id={period.id}
          periodFrom={period.periodFrom}
          periodTo={period.periodTo}
          values={values}
        />
      );
    });
  };

  // FIXME: any
  const renderPaperOptions = () => {
    return (
      <>
        <DatePicker
          id={'drivingListDatePicker'}
          isRequired={true}
          value={values?.selectedDate}
          onChange={(date: string) => onDateChange(date)}
          locale={'nb-NO'}
          readOnly={false}
          error={undefined}
          inputRef={undefined}
        />
        <RadioGroup
          legend="Velg periode for innsending"
          onChange={(value) => onPeriodChange(value)}
          value={values?.selectedPeriodType}
        >
          <Radio value="weekly">{'Ukentlig'}</Radio>
          <Radio value="monthly">{'Månedlig'}</Radio>
        </RadioGroup>
        <RadioGroup
          legend="Skal du registrere parkering?"
          onChange={(value) => onParkingChange(value)}
          value={values?.parking}
        >
          <Radio value={true}>{'Ja'}</Radio>
          <Radio value={false}>{'Nei'}</Radio>
        </RadioGroup>
      </>
    );
  };

  return (
    <>
      {submissionMethod === 'paper' && renderPaperOptions()}
      <Accordion>{submissionMethod === 'paper' ? renderPaperDrivingList() : renderDigitalDrivingList()} </Accordion>
    </>
  );
};

export default NavDrivingList;
