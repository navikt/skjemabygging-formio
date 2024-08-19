import { SummaryField as SummaryFieldType } from '@navikt/skjemadigitalisering-shared-domain';
import InnerHtml from '../../inner-html/InnerHtml';

export interface Props {
  component: SummaryFieldType;
  html?: boolean;
}

const SummaryField = ({ component, html }: Props) => (
  <>
    <dt>{component.label}</dt>
    {html ? <InnerHtml tag="dd" content={`${component.value}`} /> : <dd>{component.value}</dd>}
  </>
);

export default SummaryField;
