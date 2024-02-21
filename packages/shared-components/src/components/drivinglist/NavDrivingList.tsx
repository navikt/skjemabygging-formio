import { Accordion } from '@navikt/ds-react';
import { SendInnAktivitet } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect, useState } from 'react';
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

  // FIXME: Get the correct submission method here
  const submissionMethod = 'digital';

  useEffect(() => {
    const fetchData = async () => {
      // FIXME: Update if statement
      if (appConfig?.app === 'fyllut') {
        const result = await getActivities(appConfig);

        if (result) {
          setActivities(result);
        }
      }
    };

    fetchData();
  }, []);

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
          hasParking={true}
          onValueChange={onValueChange}
          id={period.id}
          periodFrom={period.periodFrom}
          periodTo={period.periodTo}
          values={values}
        />
      );
    });
  };

  return (
    <Accordion>{submissionMethod === 'digital' ? renderDigitalDrivingList() : renderPaperDrivingList()} </Accordion>
  );
};

export default NavDrivingList;
