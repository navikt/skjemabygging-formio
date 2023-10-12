import { Summary } from '@navikt/skjemadigitalisering-shared-domain';
import ComponentSummary from './ComponentSummary';

interface Props {
  component: Summary.DataGrid;
  formUrl: string;
}

const DataGridSummary = ({ component, formUrl }: Props) => (
  <>
    <dt>{component.label}</dt>
    <dd>
      {component.components &&
        component.components.map((row) => (
          <div className="data-grid__row" key={row.key}>
            {row.label && <p className="navds-body-short font-bold">{row.label}</p>}
            <dl>
              <ComponentSummary components={row.components} formUrl={formUrl} />
            </dl>
          </div>
        ))}
    </dd>
  </>
);

export default DataGridSummary;
