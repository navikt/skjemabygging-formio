import { DataFetcherElement } from '@navikt/skjemadigitalisering-shared-domain';
import { useStateField } from '../../context/state/useStateField';
import CheckboxGroup from '../checkbox-group/CheckboxGroup';
import { ReadMoreProps } from '../read-more/ReadMore';
import { getSelectedValuesAsList, getSelectedValuesMap } from './dataFetcherUtils';

interface DataFetcherProps {
  statePath: string;
  label: string;
  description?: string;
  readMore?: ReadMoreProps;
  values: DataFetcherElement[];
  required?: boolean;
}

const DataFetcher = ({ statePath, label, description, readMore, values, required = false }: DataFetcherProps) => {
  const { stateValue, error, setStateValue } = useStateField({ statePath });

  if (values.length === 0) {
    return null;
  }

  return (
    <CheckboxGroup
      statePath={statePath}
      legend={label}
      description={description}
      values={values}
      value={getSelectedValuesAsList(stateValue as Record<string, boolean> | undefined)}
      onChange={(selectedValues) => setStateValue(getSelectedValuesMap(values, selectedValues))}
      error={error}
      readMore={readMore}
      required={required}
    />
  );
};

export default DataFetcher;
export type { DataFetcherProps };
