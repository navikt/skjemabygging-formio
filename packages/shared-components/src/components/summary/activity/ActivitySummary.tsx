import { SummaryActivity } from '@navikt/skjemadigitalisering-shared-domain';

export interface Props {
  component: SummaryActivity;
}

const ActivitySummary = ({ component }: Props) => {
  return (
    <>
      <dt>{component.label}</dt>
      <dd>{component.value.text}</dd>
    </>
  );
};

export default ActivitySummary;
