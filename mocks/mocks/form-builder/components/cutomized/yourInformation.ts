import { BaseComponentType } from '../../shared/baseComponent';
import container from '../group/container';
import address from './address';
import addressValidity from './addressValidity';
import firstName from './firstName';
import identity from './identity';
import surname from './surname';

interface YourInformationType extends BaseComponentType {
  components?: any[];
}

const yourInformation = (props: YourInformationType = {}) => {
  const { components, key, label } = props;

  return container({
    key: key ?? 'dineOpplysninger',
    label: label ?? 'Dine opplysninger',
    yourInformation: true,
    components: components || [
      firstName({ key: 'fornavn', prefill: true, prefillKey: 'sokerFornavn', protectedApiKey: true }),
      surname({
        key: 'etternavn',
        prefill: true,
        prefillKey: 'sokerEtternavn',
        protectedApiKey: true,
      }),
      identity({ prefill: true }),
      address({
        prefill: true,
        prefillKey: 'sokerAdresser',
        customConditional:
          'show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)',
        protectedApiKey: true,
      }),
      addressValidity({
        protectedApiKey: true,
        customConditional:
          'show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)',
      }),
    ],
  });
};

export default yourInformation;
