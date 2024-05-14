import { Summary } from '@navikt/skjemadigitalisering-shared-domain';
import { InnerHtml } from '../../../index';

export interface Props {
  component: Summary.Field;
  html?: boolean;
}

const SummaryField = ({ component, html }: Props) => (
  <>
    <dt>{component.label}</dt>
    {html ? <InnerHtml tag="dd" content={`${component.value}`} /> : <dd>{component.value}</dd>}
  </>
);

export default SummaryField;
