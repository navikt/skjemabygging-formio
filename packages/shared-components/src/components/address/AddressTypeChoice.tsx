import { Radio, RadioGroup } from '@navikt/ds-react';
import { AddressInput, AddressInputType } from './Address';

interface Props {
  onChange: (type: AddressInputType, value: string) => void;
  values: AddressInput;
}

const AddressTypeChoice = ({ onChange, values }: Props) => {
  // TODO: Oversetting
  return (
    <>
      <RadioGroup
        className="form-group"
        legend="Bor du i Norge"
        value={values.borDuINorge}
        onChange={(value) => onChange('borDuINorge', value)}
      >
        <Radio value="true">Ja</Radio>
        <Radio value="false">Nei</Radio>
      </RadioGroup>

      <RadioGroup
        className="form-group"
        legend="Er kontaktadressen din en vegadresse eller postboksadresse?"
        onChange={(value) => onChange('vegadresseEllerPostboksadresse', value)}
      >
        <Radio value="vegadresse">Vegadresse</Radio>
        <Radio value="postboksadresse">Postboksadresse</Radio>
      </RadioGroup>
    </>
  );
};

export default AddressTypeChoice;
