import { Summary } from '@navikt/skjemadigitalisering-shared-domain';

export interface Props {
  component: Summary.Activity;
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
