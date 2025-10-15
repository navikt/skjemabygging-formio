import { SummaryAddress } from '@navikt/skjemadigitalisering-shared-domain';

interface Props {
  component: SummaryAddress;
}
const AddressSummary = ({ component }: Props) => {
  return (
    <>
      <dt>{component.label}</dt>
      <dd>{component.value}</dd>
    </>
  );
};

export default AddressSummary;
