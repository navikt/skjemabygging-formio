import BirthDateField from './fields/BirthDateField';
import DoYouHaveIdentityNumberRadio from './fields/DoYouHaveIdentityNumberRadio';
import IdentityNumberField from './fields/IdentityNumberField';
import { IdentityProvider } from './identityContext';

export interface IdentityInput {
  harDuFodselsnummer?: boolean;
  identifikasjonsnummer?: string;
  fodselsdato?: string;
}

interface Props {
  onChange: (value: any) => void;
  readOnly?: boolean;
  required?: boolean;
  className?: string;
  nationalIdentity: IdentityInput;
}

const Identity = ({ readOnly, required, onChange, nationalIdentity, className }: Props) => {
  return (
    <IdentityProvider
      nationalIdentity={nationalIdentity}
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
          {nationalIdentity?.harDuFodselsnummer !== undefined &&
            (nationalIdentity?.harDuFodselsnummer ? <IdentityNumberField /> : <BirthDateField />)}
        </>
      )}
    </IdentityProvider>
  );
};

export default Identity;
