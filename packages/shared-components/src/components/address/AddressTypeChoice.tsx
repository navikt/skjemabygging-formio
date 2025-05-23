import { SubmissionAddress, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useComponentUtils } from '../../context/component/componentUtilsContext';
import Radio from '../radio/Radio';
import { SubmissionAddressType } from './Address';

interface Props {
  onChange: (type: SubmissionAddressType, value: string) => void;
  values: SubmissionAddress;
  label?: string;
}

const AddressTypeChoice = ({ onChange, values, label }: Props) => {
  const { translate, getComponentError, addRef } = useComponentUtils();

  return (
    <>
      <Radio
        className="form-group"
        legend={translate(label ?? TEXTS.statiske.address.livesInNorway)}
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
        ref={(ref) => addRef('address:borDuINorge', ref)}
        error={getComponentError('address:borDuINorge')}
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
          ref={(ref) => addRef('address:vegadresseEllerPostboksadresse', ref)}
          error={getComponentError('address:vegadresseEllerPostboksadresse')}
        />
      )}
    </>
  );
};

export default AddressTypeChoice;
