import { Summary } from "@navikt/skjemadigitalisering-shared-domain";

interface Props {
  component: Summary.Selectboxes;
}

const SelectBoxesSummary = ({ component }: Props) => (
  <>
    <dt>{component.label}</dt>
    <dd>
      <ul>
        {component.value.map((value) => (
          <li key={`${component.label}_${value}`}>{value}</li>
        ))}
      </ul>
    </dd>
  </>
);

export default SelectBoxesSummary;
