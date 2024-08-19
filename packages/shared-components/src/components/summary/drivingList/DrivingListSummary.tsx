import { SummaryDrivingList } from '@navikt/skjemadigitalisering-shared-domain';

export interface Props {
  component: SummaryDrivingList;
}

const DrivingListSummary = ({ component }: Props) => {
  return (
    <>
      <dt>{component.label}</dt>
      <dd>
        <p>{component.value.description}</p>
        <ul>
          {(component.value.dates ?? []).map((date) => {
            return <li key={date.key}>{date.text}</li>;
          })}
        </ul>
      </dd>
    </>
  );
};

export default DrivingListSummary;
