import { Checkbox, CheckboxGroup, Radio, RadioGroup } from '@navikt/ds-react';
import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode } from 'react';

interface Props {
  title: ReactNode;
  description: ReactNode;
  error: ReactNode;
  values?: ComponentValue[];
  onChange: (value: any) => void;
}

const SingleSelect = ({ values = [], title, description, error, onChange }: Props) => {
  const handleChange = (values) => {
    onChange(Array.isArray(values) ? values[0] : values);
  };

  if (values.length === 1) {
    return (
      <CheckboxGroup legend={title} description={description} error={error} onChange={handleChange}>
        {values.map((keyValue) => (
          <Checkbox key={keyValue.value} value={keyValue.value}>
            {keyValue.label}
          </Checkbox>
        ))}
      </CheckboxGroup>
    );
  } else if (values.length > 1) {
    return (
      <RadioGroup legend={title} description={description} error={error} onChange={handleChange}>
        {values.map((keyValue) => (
          <Radio key={keyValue.value} value={keyValue.value}>
            {keyValue.label}
          </Radio>
        ))}
      </RadioGroup>
    );
  } else {
    return <div className="navds-label">{title}</div>;
  }
};

export default SingleSelect;
