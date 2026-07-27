import { Radio as AkselRadio, RadioGroup as AkselRadioGroup } from '@navikt/ds-react';
import { ComponentValue } from '@navikt/skjemadigitalisering-shared-domain';
import { forwardRef, Fragment, ReactNode } from 'react';
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
        {values.map((obj, index, arr) => {
          const label = translate(obj.label);
          const optionDescription = translate(obj.description);
          const descriptionId = optionDescription ? `${id}-${index}-description` : undefined;

          return (
            <Fragment key={obj.value}>
              <AkselRadio
                value={obj.value}
                aria-label={label}
                aria-describedby={descriptionId}
                description={optionDescription}
                onFocus={focusHandler(obj.value)}
                onBlur={blurHandler(obj.value)}
                ref={(r) => {
                  addRef(obj.value, r);
                  if (r && reactResolve && index === arr.length - 1) {
                    reactResolve();
                  }
                }}
              >
                {label}
              </AkselRadio>
              {optionDescription && (
                <span id={descriptionId} hidden>
                  {optionDescription}
                </span>
              )}
            </Fragment>
          );
        })}
      </AkselRadioGroup>
    );
  },
);

export default Radio;
