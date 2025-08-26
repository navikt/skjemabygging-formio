import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import addressBuilder from '../../core/address/Address.builder';
import addressValidityBuilder from '../../extensions/address-validitity/AddressValidity.builder';
import firstNameBuilder from '../../extensions/first-name/FirstName.builder';
import identityBuilder from '../../extensions/identity/Identity.builder';
import surnameBuilder from '../../extensions/surname/Surname.builder';

const yourInformationBuilder = () => {
  return {
    title: 'Dine opplysninger',
    schema: {
      type: 'container',
      key: 'dineOpplysninger',
      label: 'Dine opplysninger',
      yourInformation: true,
      input: true,
      components: [
        {
          ...firstNameBuilder().schema,
          prefill: true,
          prefillKey: 'sokerFornavn',
          protectedApiKey: true,
        },
        {
          ...surnameBuilder().schema,
          prefill: true,
          prefillKey: 'sokerEtternavn',
          protectedApiKey: true,
        },
        {
          ...identityBuilder().schema,
          prefill: true,
          prefillKey: 'sokerIdentifikasjonsnummer',
          protectedApiKey: true,
          customLabels: {
            doYouHaveIdentityNumber: TEXTS.statiske.identity.doYouHaveIdentityNumber,
          },
        },
        {
          ...addressBuilder().schema,
          prefill: true,
          prefillKey: 'sokerAdresser',
          customConditional:
            'show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)',
          protectedApiKey: true,
          customLabels: {
            livesInNorway: TEXTS.statiske.address.livesInNorway,
          },
        },
        {
          ...addressValidityBuilder().schema,
          customConditional:
            'show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)',
          protectedApiKey: true,
        },
        {
          label: 'Alertstripe',
          content:
            '<p>Nav sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse. Du kan <a href="https://www.skatteetaten.no/person/folkeregister/flytte/endre-postadresse/" target="_blank" rel="noopener noreferrer">sjekke og endre din folkeregistrerte adresse på Skatteetatens nettsider (åpnes i ny fane)</a>.</p>',
          key: 'alertstripe',
          type: 'alertstripe',
          alerttype: 'info',
          customConditional: 'show = row.identitet.harDuFodselsnummer === "ja"',
        },
        {
          label: 'Alertstripe',
          content:
            '<p>Adressen er hentet fra Folkeregisteret. Du kan <a href="https://www.skatteetaten.no/person/folkeregister/flytte/endre-postadresse/" target="_blank" rel="noopener noreferrer"> endre adressen på Skatteetatens nettsider (åpnes i ny fane)</a>.</p>',
          key: 'alertstripePrefill',
          type: 'alertstripe',
          alerttype: 'info',
          customConditional: 'show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer',
        },
      ],
    },
  };
};

export default yourInformationBuilder;
