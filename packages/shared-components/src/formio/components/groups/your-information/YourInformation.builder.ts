import addressBuilder from '../../core/address/Address.builder';
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
      components: [
        {
          ...firstNameBuilder().schema,
          prefill: true,
          prefillKey: 'sokerFornavn',
        },
        {
          ...surnameBuilder().schema,
          prefill: true,
          prefillKey: 'sokerEtternavn',
        },
        {
          ...identityBuilder().schema,
          prefill: true,
          prefillKey: 'sokerIdentifikasjonsnummer',
        },
        {
          ...addressBuilder().schema,
          prefill: true,
          prefillKey: 'sokerAdresser',
          customConditional:
            'show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)',
        },
        {
          label: 'Fra hvilken dato skal denne adressen brukes (dd.mm.åååå)?',
          key: 'gyldigFraDatoDdMmAaaa',
          type: 'navDatepicker',
          mayBeEqual: false,
          earliestAllowedDate: -365,
          latestAllowedDate: 365,
          validate: {
            required: true,
          },
          customConditional:
            'show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)',
        },
        {
          label: 'Til hvilken dato skal denne adressen brukes (dd.mm.åååå)?',
          key: 'gyldigTilDatoDdMmAaaa',
          type: 'navDatepicker',
          description:
            'Du velger selv hvor lenge adressen skal være gyldig, maksimalt 1 år. Etter 1 år må du endre eller forlenge adressen.',
          beforeDateInputKey: 'dineOpplysninger.gyldigFraDatoDdMmAaaa',
          latestAllowedDate: 365,
          mayBeEqual: false,
          validate: {
            required: true,
          },
          customConditional:
            'show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)',
        },
        {
          label: 'Alertstripe',
          content:
            '<p>Nav sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse. Du kan <a href="https://www.skatteetaten.no/person/folkeregister/flytte/endre-postadresse/" target="_blank" rel="noopener noreferrer"> sjekke og endre din folkeregistrerte adresse på skatteetatens nettsider (åpnes i ny fane)</a>.</p>',
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
