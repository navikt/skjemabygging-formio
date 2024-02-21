import { Accordion, DatePicker, Radio, RadioGroup, useDatepicker } from '@navikt/ds-react';
import { SendInnAktivitet } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { getActivities } from '../../api/sendinn/sendInnActivities';
import DrivingPeriod from './DrivingPeriod';

interface NavDrivingListProps {
  onValueChange: (value: any) => void;
  appConfig: any;
  values: any;
}

interface DrivingListPeriod {
  periodFrom: Date;
  periodTo: Date;
  hasParking: boolean;
  id: string;
}

const NavDrivingList = ({ appConfig, onValueChange, values }: NavDrivingListProps) => {
  const [activities, setActivities] = useState<SendInnAktivitet[]>([]);
  const [periods, setPeriods] = useState<DrivingListPeriod[]>([]);
  const [parking, setParking] = useState<boolean>(false);
  const [periodType, setPeriodType] = useState<'weekly' | 'monthly'>();

  const { datepickerProps, inputProps, selectedDay } = useDatepicker({
    onDateChange: (date) => onDateChange(date),
  });

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

  const generatePeriods = (periodType: 'weekly' | 'monthly', date?: Date) => {
    if (!date) return;

    const drivingListPeriods: DrivingListPeriod[] = [];
    const startDate = new Date(date);
    const endDate = new Date(date);

    if (periodType === 'weekly') {
      endDate.setDate(endDate.getDate() + 6);
    } else if (periodType === 'monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    }

    drivingListPeriods.push({ periodFrom: startDate, periodTo: endDate, hasParking: parking, id: uuidv4() });

    return drivingListPeriods;
  };

  const onDateChange = (date?: Date) => {
    if (periodType === 'weekly') {
      setPeriods(generatePeriods('weekly', date) ?? []);
    } else if (periodType === 'monthly') {
      setPeriods(generatePeriods('monthly', date) ?? []);
    }
  };

  const onPeriodChange = (period: 'weekly' | 'monthly') => {
    if (period === 'weekly') {
      setPeriods(generatePeriods('weekly', selectedDay) ?? []);
      setPeriodType('weekly');
    } else {
      setPeriods(generatePeriods('monthly', selectedDay) ?? []);
      setPeriodType('monthly');
    }
  };

  const onParkingChange = (parking: string) => {
    if (parking === 'true') setParking(true);
    if (parking === 'false') setParking(false);
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
    return periods.map((period) => {
      return (
        <DrivingPeriod
          key={period.id}
          hasParking={parking}
          onValueChange={onValueChange}
          id={period.id}
          periodFrom={period.periodFrom}
          periodTo={period.periodTo}
          values={values}
        />
      );
    });
  };

  const renderPaperOptions = () => {
    return (
      <>
        <DatePicker {...datepickerProps}>
          <DatePicker.Input {...inputProps} label="Velg første dato" />
        </DatePicker>
        <RadioGroup legend="Velg periode for innsending" onChange={(value) => onPeriodChange(value)}>
          <Radio value="weekly">{'Ukentlig'}</Radio>
          <Radio value="monthly">{'Månedlig'}</Radio>
        </RadioGroup>
        <RadioGroup legend="Skal du registrere parkering?" onChange={(value) => onParkingChange(value)}>
          <Radio value="true">{'Ja'}</Radio>
          <Radio value="false">{'Nei'}</Radio>
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
