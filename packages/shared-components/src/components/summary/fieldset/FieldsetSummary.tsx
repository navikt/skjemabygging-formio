import { Summary } from '@navikt/skjemadigitalisering-shared-domain';
import ComponentSummary from '../component/ComponentSummary';

interface Props {
  component: Summary.Fieldset;
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
