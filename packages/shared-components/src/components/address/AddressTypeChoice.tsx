import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useComponentUtils } from '../../context/component/componentUtilsContext';
import Radio from '../radio/Radio';
import { AddressInput, AddressInputType } from './Address';

interface Props {
  onChange: (type: AddressInputType, value: string) => void;
  values: AddressInput;
}

const AddressTypeChoice = ({ onChange, values }: Props) => {
  const { translate, getComponentError, addRef } = useComponentUtils();

  return (
    <>
      <Radio
        className="form-group"
        legend={translate(TEXTS.statiske.address.livesInNorway)}
        value={values?.borDuINorge ?? ''}
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
        onChange={(value) => onChange('borDuINorge', value)}
        ref={(ref) => addRef('borDuINorge', ref)}
        error={getComponentError('borDuINorge')}
      />
      {values?.borDuINorge === 'ja' && (
        <Radio
          className="form-group"
          legend={translate(TEXTS.statiske.address.yourContactAddress)}
          value={values?.vegadresseEllerPostboksadresse ?? ''}
          values={[
            {
              value: 'vegadresse',
              label: translate(TEXTS.statiske.address.streetAddress),
            },
            {
              value: 'postboksadresse',
              label: translate(TEXTS.statiske.address.poAddress),
            },
          ]}
          onChange={(value) => onChange('vegadresseEllerPostboksadresse', value)}
          ref={(ref) => addRef('vegadresseEllerPostboksadresse', ref)}
          error={getComponentError('vegadresseEllerPostboksadresse')}
        />
      )}
    </>
  );
};

export default AddressTypeChoice;
