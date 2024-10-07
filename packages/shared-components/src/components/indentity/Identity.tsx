import BirthDateField from './fields/BirthDateField';
import DoYouHaveIdentityNumberRadio from './fields/DoYouHaveIdentityNumberRadio';
import IdentityNumberField from './fields/IdentityNumberField';
import { IdentityProvider } from './identityContext';

export interface IdentityInput {
  harDuFodselsnummer?: string;
  identitetsnummer?: string;
  fodselsdato?: string;
}

export type IdentityInputType = keyof IdentityInput;

interface Props {
  onChange: (value: any) => void;
  readOnly?: boolean;
  required?: boolean;
  className?: string;
  identity: IdentityInput;
}

const Identity = ({ readOnly, required, onChange, identity, className }: Props) => {
  return (
    <IdentityProvider
      nationalIdentity={identity}
      readOnly={readOnly}
      required={required}
      onChange={onChange}
      className={className}
    >
      {readOnly ? (
        <IdentityNumberField />
      ) : (
        <>
          <DoYouHaveIdentityNumberRadio />
          {identity?.harDuFodselsnummer !== undefined &&
            (identity?.harDuFodselsnummer === 'ja' ? <IdentityNumberField /> : <BirthDateField />)}
        </>
      )}
    </IdentityProvider>
  );
};

export default Identity;
