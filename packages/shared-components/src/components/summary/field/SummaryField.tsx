import { Summary } from '@navikt/skjemadigitalisering-shared-domain';
import DOMPurify from 'dompurify';

export interface Props {
  component: Summary.Field;
  html?: boolean;
}

const SummaryField = ({ component, html }: Props) => (
  <>
    <dt>{component.label}</dt>
    {html ? (
      <dd dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(`${component.value}`) }} />
    ) : (
      <dd>{component.value}</dd>
    )}
  </>
);

export default SummaryField;
