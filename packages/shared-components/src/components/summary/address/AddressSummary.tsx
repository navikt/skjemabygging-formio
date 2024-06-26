import { Link } from '@navikt/ds-react';
import { Summary } from '@navikt/skjemadigitalisering-shared-domain';
interface Props {
  component: Summary.Address;
}

const AttachmentSummary = ({ component }: Props) => {
  return (
    <>
      <dt>{component.label}</dt>
      <dd>{component.value.address}</dd>
      <Link href="https://www.skatteetaten.no/person/folkeregister/flytte">{component.value.linkText}</Link>
    </>
  );
};

export default AttachmentSummary;
