import { Checkbox, CheckboxGroup } from '@navikt/ds-react';
import { forwardRef, ReactNode } from 'react';
import { useComponentUtils } from '../../context/component/componentUtilsContext';

interface Props {
  label: ReactNode;
  description?: ReactNode;
  className?: string;
  value?: string[];
  onChange: (value: any) => void;
  error?: ReactNode;
}

const ReactKomponenten = forwardRef<HTMLFieldSetElement, Props>(
  ({ label, value, description, className, onChange, error }, ref) => {
    const { translate } = useComponentUtils();

    const values = [
      { value: 'eple', label: 'Eple', description: 'Rød' },
      { value: 'banan', label: 'Banan', description: undefined },
    ];

    return (
      <CheckboxGroup
        legend={label}
        description={description}
        defaultValue={value}
        onChange={onChange}
        ref={ref}
        className={className}
        error={error}
      >
        {values.map((obj) => (
          <Checkbox key={obj.value} value={obj.value} description={obj?.description}>
            {translate(obj.label)}
          </Checkbox>
        ))}
      </CheckboxGroup>
    );
  },
);

export default ReactKomponenten;
