import addressBuilder from '../../core/address/Address.builder';
import firstNameBuilder from '../../extensions/first-name/FirstName.builder';
import identityBuilder from '../../extensions/identity/Identity.builder';
import surnameBuilder from '../../extensions/surname/Surname.builder';

const yourInformationBuilder = () => {
  return {
    title: 'Dine opplysninger',
    schema: {
      type: 'container',
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
          customConditional: 'show = row.identitet.harDuFodselsnummer === "no"',
        },
        {
          label: 'Fra hvilken dato skal denne adressen brukes (dd.mm.åååå)?',
          key: 'gyldigFraDatoDdMmAaaa',
          type: 'navDatepicker',
          mayBeEqual: false,
          validate: {
            required: true,
            custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
          },
          customConditional: 'show = row.identitet.harDuFodselsnummer === "no"',
        },
        {
          label: 'Til hvilken dato skal denne adressen brukes (dd.mm.åååå)?',
          key: 'gyldigTilDatoDdMmAaaa',
          type: 'navDatepicker',
          description:
            'Du velger selv hvor lenge adressen skal være gyldig, maksimalt 1 år. Etter 1 år må du endre eller forlenge adressen.',
          beforeDateInputKey: 'gyldigFraDatoDdMmAaaa',
          mayBeEqual: false,
          validate: {
            required: true,
            custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
          },
          customConditional: 'show = row.identitet.harDuFodselsnummer === "no"',
        },
        {
          label: 'Alertstripe',
          content:
            '<p>NAV sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse. Du kan <a href="https://www.skatteetaten.no/person/folkeregister/flytte/endre-postadresse/" target="_blank" rel="noopener noreferrer"> sjekke og endre din folkeregistrerte adresse på skatteetatens nettsider (åpnes i ny fane)</a>.</p>',
          key: 'alertstripe',
          type: 'alertstripe',
          alerttype: 'info',
          customConditional: 'show = row.identitet.harDuFodselsnummer === "yes" || row.identitet.identitetsnummer',
        },
      ],
    },
  };
};

export default yourInformationBuilder;
