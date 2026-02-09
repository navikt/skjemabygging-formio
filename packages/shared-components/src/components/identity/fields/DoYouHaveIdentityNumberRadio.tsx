import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import clsx from 'clsx';
import { useComponentUtils } from '../../../context/component/componentUtilsContext';
import Radio from '../../radio/Radio';
import { useIdentity } from '../identityContext';

interface Props {
  label?: string;
}

const DoYouHaveIdentityNumberRadio = ({ label }: Props) => {
  const { translate, addRef, getComponentError } = useComponentUtils();
  const { nationalIdentity, onChange, className, readOnly } = useIdentity();

  const handleChange = (value: string) => {
    onChange({
      harDuFodselsnummer: value,
    });
  };

  const refId = 'identity:harDuFodselsnummer';

  return (
    <Radio
      legend={translate(label ?? TEXTS.statiske.identity.doYouHaveIdentityNumber)}
      value={nationalIdentity?.harDuFodselsnummer}
      values={[
        {
          value: 'ja',
          label: translate(TEXTS.common.yes),
        },
        {
          value: 'nei',
          label: translate(TEXTS.common.no),
        },
      ]}
      onChange={(value) => handleChange(value)}
      className={clsx('mb', className)}
      readOnly={readOnly}
      ref={(ref) => addRef(refId, ref)}
      error={getComponentError(refId)}
    />
  );
};

export default DoYouHaveIdentityNumberRadio;
