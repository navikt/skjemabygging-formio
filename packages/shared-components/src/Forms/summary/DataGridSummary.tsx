import { Summary } from "@navikt/skjemadigitalisering-shared-domain";
import ComponentSummary from "./ComponentSummary";

interface Props {
  component: Summary.DataGrid;
}

const DataGridSummary = ({ component }: Props) => (
  <>
    <dt>{component.label}</dt>
    <dd>
      {component.components &&
        component.components.map((row) => (
          <div className="data-grid__row">
            {row.label && <p className="navds-body-short font-bold">{row.label}</p>}
            <dl>
              <ComponentSummary components={row.components} />
            </dl>
          </div>
        ))}
    </dd>
  </>
);

export default DataGridSummary;
