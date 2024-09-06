import { TextField as AkselTextField } from '@navikt/ds-react';
import { ChangeEvent, HTMLInputAutoCompleteAttribute, LegacyRef, ReactElement } from 'react';

interface Props {
  id: string;
  defaultValue?: string;
  setInstance?: LegacyRef<HTMLInputElement>;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  label: string | ReactElement;
  hideLabel?: boolean;
  description: string | ReactElement;
  className?: string;
  autoComplete?: HTMLInputAutoCompleteAttribute;
  readOnly?: boolean;
  spellCheck?: boolean;
  error?: string;
  inputMode?: 'email' | 'tel' | 'text' | 'search' | 'none' | 'url' | 'numeric' | 'decimal';
  type?: 'password' | 'text';
}

const NavTextField = ({
  id,
  defaultValue,
  setInstance,
  onChange,
  label,
  hideLabel,
  description,
  className,
  autoComplete,
  readOnly,
  spellCheck,
  error,
  inputMode,
  type,
}: Props) => {
  return (
    <AkselTextField
      id={id}
      defaultValue={defaultValue}
      ref={setInstance}
      onChange={onChange}
      label={label}
      hideLabel={hideLabel}
      description={description}
      className={className}
      autoComplete={autoComplete}
      readOnly={readOnly}
      spellCheck={spellCheck}
      error={error}
      inputMode={inputMode}
      type={type}
    />
  );
};
export default NavTextField;
