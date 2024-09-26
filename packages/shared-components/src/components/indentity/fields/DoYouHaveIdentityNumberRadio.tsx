import { Radio, RadioGroup } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import classNames from 'classnames';
import { useComponentUtils } from '../../../context/component/componentUtilsContext';
import { useIdentity } from '../identityContext';

const DoYouHaveIdentityNumberRadio = () => {
  const { translate, addRef, getComponentError } = useComponentUtils();
  const { nationalIdentity, onChange, className } = useIdentity();

  const handleChange = (value: string) => {
    onChange({
      ...nationalIdentity,
      harDuFodselsnummer: value === 'yes',
    });
  };

  const refId = 'identity:harDuFodselsnummer';

  return (
    <RadioGroup
      legend={translate(TEXTS.statiske.identity.doYouHaveIdentityNumber)}
      onChange={(value) => handleChange(value)}
      defaultValue={nationalIdentity?.harDuFodselsnummer}
      error={getComponentError(refId)}
      ref={(ref) => addRef(refId, ref)}
      className={classNames('mb', className)}
    >
      <Radio value="yes" ref={(ref) => addRef(`${refId}:yes`, ref)}>
        {translate(TEXTS.common.yes)}
      </Radio>
      <Radio value="no" ref={(ref) => addRef(`${refId}:no`, ref)}>
        {translate(TEXTS.common.no)}
      </Radio>
    </RadioGroup>
  );
};

export default DoYouHaveIdentityNumberRadio;
