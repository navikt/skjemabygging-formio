import { Summary } from '@navikt/skjemadigitalisering-shared-domain';

export interface Props {
  component: Summary.Field;
}

const SummaryField = ({ component }: Props) => (
  <>
    <dt>{component.label}</dt>
    <dd dangerouslySetInnerHTML={{ __html: component.value }} />
  </>
);

export default SummaryField;
