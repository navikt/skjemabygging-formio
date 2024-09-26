import { Radio, RadioGroup } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useComponentUtils } from '../../context/component/componentUtilsContext';
import { AddressInput, AddressInputType } from './Address';

interface Props {
  onChange: (type: AddressInputType, value: string) => void;
  values: AddressInput;
}

const AddressTypeChoice = ({ onChange, values }: Props) => {
  const { translate } = useComponentUtils();

  return (
    <>
      <RadioGroup
        className="form-group"
        legend={translate(TEXTS.statiske.address.livesInNorway)}
        value={values?.borDuINorge ?? ''}
        onChange={(value) => onChange('borDuINorge', value)}
      >
        <Radio value="yes">{translate(TEXTS.common.yes)}</Radio>
        <Radio value="no">{translate(TEXTS.common.no)}</Radio>
      </RadioGroup>
      {values?.borDuINorge === 'yes' && (
        <RadioGroup
          className="form-group"
          legend={translate(TEXTS.statiske.address.yourContactAddress)}
          value={values?.vegadresseEllerPostboksadresse ?? ''}
          onChange={(value) => onChange('vegadresseEllerPostboksadresse', value)}
        >
          <Radio value="vegadresse">{translate(TEXTS.statiske.address.streetAddress)}</Radio>
          <Radio value="postboksadresse">{translate(TEXTS.statiske.address.poAddress)}</Radio>
        </RadioGroup>
      )}
    </>
  );
};

export default AddressTypeChoice;
