import { Checkbox, CheckboxGroup, Radio, RadioGroup } from '@navikt/ds-react';
import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode } from 'react';

interface Props {
  title: ReactNode;
  values?: ComponentValue[];
}

const SingleSelect = ({ values = [], title }: Props) => {
  if (values.length === 1) {
    return !(
      <CheckboxGroup legend={title} size="medium">
        {values.map((keyValue) => (
          <Checkbox key={keyValue.value} value={keyValue.value}>
            {keyValue.label}
          </Checkbox>
        ))}
      </CheckboxGroup>
    );
  } else if (values.length > 1) {
    return (
      <RadioGroup legend={title} size="medium">
        {values.map((keyValue) => (
          <Radio key={keyValue.value} value={keyValue.value}>
            {keyValue.label}
          </Radio>
        ))}
      </RadioGroup>
    );
  }
};

export default SingleSelect;
