import { SummaryFieldset } from '@navikt/skjemadigitalisering-shared-domain';
import ComponentSummary from '../component/ComponentSummary';

interface Props {
  component: SummaryFieldset;
}

const FieldsetSummary = ({ component }: Props) => (
  <>
    <dt>{component.label}</dt>
    <dd>
      <dl className="component-collection">
        <ComponentSummary components={component.components} />
      </dl>
    </dd>
  </>
);

export default FieldsetSummary;
