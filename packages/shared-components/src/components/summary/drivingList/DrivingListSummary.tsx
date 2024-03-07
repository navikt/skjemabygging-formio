import { Summary, dateUtils } from '@navikt/skjemadigitalisering-shared-domain';

export interface Props {
  component: Summary.DrivingList;
}

const DrivingListSummary = ({ component }: Props) => {
  return (
    <>
      <dt>{component.label}</dt>
      <dd>
        <ul>
          {component.value.dates
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            .map((date) => {
              return (
                <li key={date.date}>{`${dateUtils.toLocaleDate(date.date)} ${
                  date.parking ? `- ${date.parking}kr` : ''
                }`}</li>
              );
            })}
        </ul>
      </dd>
    </>
  );
};

export default DrivingListSummary;
