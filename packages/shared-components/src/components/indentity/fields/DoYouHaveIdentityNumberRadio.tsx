import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import classNames from 'classnames';
import { useComponentUtils } from '../../../context/component/componentUtilsContext';
import Radio from '../../radio/Radio';
import { useIdentity } from '../identityContext';

const DoYouHaveIdentityNumberRadio = () => {
  const { translate, addRef, getComponentError } = useComponentUtils();
  const { nationalIdentity, onChange, className, readOnly } = useIdentity();

  const handleChange = (value: string) => {
    onChange({
      ...nationalIdentity,
      harDuFodselsnummer: value === 'yes',
    });
  };

  const refId = 'identity:harDuFodselsnummer';

  return (
    <Radio
      legend={translate(TEXTS.statiske.identity.doYouHaveIdentityNumber)}
      value={nationalIdentity?.harDuFodselsnummer}
      values={[
        {
          value: 'yes',
          label: translate(TEXTS.common.yes),
        },
        {
          value: 'no',
          label: translate(TEXTS.common.no),
        },
      ]}
      onChange={(value) => handleChange(value)}
      className={classNames('mb', className)}
      readOnly={readOnly}
      ref={(ref) => addRef(refId, ref)}
      error={getComponentError(refId)}
    />
  );
};

export default DoYouHaveIdentityNumberRadio;
