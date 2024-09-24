import { Radio, RadioGroup } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import classNames from 'classnames';
import { useComponentUtils } from '../../../context/component/componentUtilsContext';
import { useIdentity } from '../identityContext';

const DoYouHaveIdentityNumberRadio = () => {
  const { translate } = useComponentUtils();
  const { nationalIdentity, onChange, className } = useIdentity();

  const handleChange = (value: string) => {
    onChange({
      ...nationalIdentity,
      harDuFodselsnummer: value === 'true',
    });
  };

  return (
    <RadioGroup
      legend={translate(TEXTS.statiske.nationalIdentityNumber.doYouHaveIdentityNumber)}
      onChange={(value) => handleChange(value)}
      defaultValue={nationalIdentity?.harDuFodselsnummer}
      className={classNames('mb', className)}
    >
      <Radio value="true">{translate(TEXTS.common.yes)}</Radio>
      <Radio value="false">{translate(TEXTS.common.no)}</Radio>
    </RadioGroup>
  );
};

export default DoYouHaveIdentityNumberRadio;
