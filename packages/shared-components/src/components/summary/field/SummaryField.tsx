import { Summary } from '@navikt/skjemadigitalisering-shared-domain';

export interface Props {
  component: Summary.Field;
  html?: boolean;
}

const SummaryField = ({ component, html }: Props) => (
  <>
    <dt>{component.label}</dt>
    {html ? <dd dangerouslySetInnerHTML={{ __html: component.value }} /> : <dd>{component.value}</dd>}
  </>
);

export default SummaryField;
