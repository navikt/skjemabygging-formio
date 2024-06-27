import { SummaryFieldset } from '@navikt/skjemadigitalisering-shared-domain';
import ComponentSummary from '../component/ComponentSummary';

interface Props {
  component: SummaryFieldset;
  formUrl: string;
}

const FieldsetSummary = ({ component, formUrl }: Props) => (
  <>
    <dt>{component.label}</dt>
    <dd>
      <dl className="component-collection">
        <ComponentSummary components={component.components} formUrl={formUrl} />
      </dl>
    </dd>
  </>
);

export default FieldsetSummary;
