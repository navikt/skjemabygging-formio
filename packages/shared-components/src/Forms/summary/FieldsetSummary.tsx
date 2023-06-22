import { Summary } from "@navikt/skjemadigitalisering-shared-domain";
import ComponentSummary from "./ComponentSummary";

interface Props {
  component: Summary.Fieldset;
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
