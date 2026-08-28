import { Radio as AkselRadio, RadioGroup as AkselRadioGroup } from '@navikt/ds-react';
import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { forwardRef, ReactNode } from 'react';
import { useComponentUtils } from '../../context/component/componentUtilsContext';

interface Props {
  id?: string;
  legend: ReactNode;
  description?: ReactNode;
  value?: any;
  values: ComponentValue[];
  error: ReactNode;
  onChange: (value: any) => void;
  className: string;
  readOnly?: boolean;
}

const Radio = forwardRef<HTMLFieldSetElement, Props>(
  ({ id, legend, description, value, values, error, onChange, className, readOnly }: Props, ref) => {
    const { addRef, translate, focusHandler, blurHandler, reactResolve } = useComponentUtils();

    return (
      <AkselRadioGroup
        id={id}
        legend={legend}
        value={value}
        onChange={onChange}
        ref={ref}
        description={description}
        className={className}
        readOnly={readOnly}
        error={error}
        tabIndex={-1}
      >
        {values.map((obj, index, arr) => (
          <AkselRadio
            key={obj.value}
            value={obj.value}
            description={translate(obj.description)}
            onFocus={focusHandler(obj.value)}
            onBlur={blurHandler(obj.value)}
            ref={(r) => {
              addRef(obj.value, r);
              if (r && reactResolve && index === arr.length - 1) {
                reactResolve();
              }
            }}
          >
            {translate(obj.label)}
          </AkselRadio>
        ))}
      </AkselRadioGroup>
    );
  },
);

export default Radio;
