import { SubmissionIdentity } from '@navikt/skjemadigitalisering-shared-domain';
import BirthDateField from './fields/BirthDateField';
import DoYouHaveIdentityNumberRadio from './fields/DoYouHaveIdentityNumberRadio';
import IdentityNumberField from './fields/IdentityNumberField';
import { IdentityProvider } from './identityContext';

export type SubmissionIdentityType = keyof SubmissionIdentity;

interface Props {
  onChange: (value: any) => void;
  readOnly?: boolean;
  required?: boolean;
  className?: string;
  identity: SubmissionIdentity;
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
