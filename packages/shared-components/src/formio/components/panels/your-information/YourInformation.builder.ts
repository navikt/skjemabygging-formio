import norskPostboksadresseSchema from '../../../form-builder-options/schemas/norskPostboksadresseSchema';
import norskVegadresseSchema from '../../../form-builder-options/schemas/norskVegadresseSchema';
import utenlandskAdresseSchema from '../../../form-builder-options/schemas/utenlandskAdresseSchema';
import firstNameBuilder from '../../extensions/first-name/FirstName.builder';
import nationalIdentityNumberBuilder from '../../extensions/national-identity-number/NationalIdentityNumber.builder';
import surnameBuilder from '../../extensions/surname/Surname.builder';

const yourInformationBuilder = () => {
  const keyPostfix = 'Soker';

  return {
    title: 'Dine opplysninger',
    schema: {
      title: 'Dine opplysninger',
      type: 'panel',
      key: 'personopplysninger',
      input: false,
      theme: 'default',
      components: [
        firstNameBuilder(keyPostfix).schema,
        surnameBuilder(keyPostfix).schema,
        {
          label: 'Har du norsk fødselsnummer eller d-nummer?',
          key: 'harDuNorskFodselsnummerEllerDNummer',
          type: 'radiopanel',
          validateOn: 'blur',
          tableView: false,
          values: [
            {
              value: 'ja',
              label: 'Ja',
            },
            {
              value: 'nei',
              label: 'Nei',
            },
          ],
          validate: {
            required: true,
          },
        },
        {
          ...nationalIdentityNumberBuilder(keyPostfix).schema,
          conditional: {
            show: true,
            when: 'harDuNorskFodselsnummerEllerDNummer',
            eq: 'ja',
          },
        },
        {
          label: 'Din fødselsdato (dd.mm.åååå)',
          visArvelger: true,
          mayBeEqual: false,
          key: 'fodselsdatoDdMmAaaaSoker',
          type: 'navDatepicker',
          tableView: false,
          validateOn: 'blur',
          validate: {
            required: true,
            custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
          },
          conditional: {
            show: true,
            when: 'harDuNorskFodselsnummerEllerDNummer',
            eq: 'nei',
          },
        },
        {
          label: 'Alertstripe',
          content:
            '<p>NAV sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse. Du kan <a href="https://www.skatteetaten.no/person/folkeregister/flytte/endre-postadresse/ " target="_blank" rel="noopener noreferrer"> sjekke og endre din folkeregistrerte adresse på skatteetatens nettsider (åpnes i ny fane)</a>.</p>',
          key: 'alertstripe',
          type: 'alertstripe',
          alerttype: 'info',
          tableView: false,
          conditional: {
            show: true,
            when: 'harDuNorskFodselsnummerEllerDNummer',
            eq: 'ja',
          },
        },
        {
          label: 'Bor du i Norge?',
          key: 'borDuINorge',
          type: 'radiopanel',
          tableView: false,
          validateOn: 'blur',
          validate: {
            required: true,
          },
          values: [
            {
              value: 'ja',
              label: 'Ja',
            },
            {
              value: 'nei',
              label: 'Nei',
            },
          ],
          conditional: {
            show: true,
            when: 'harDuNorskFodselsnummerEllerDNummer',
            eq: 'nei',
          },
        },
        {
          label: 'Er kontaktadressen din en vegadresse eller postboksadresse?',
          key: 'vegadresseEllerPostboksadresse',
          type: 'radiopanel',
          validateOn: 'blur',
          tableView: false,
          values: [
            {
              value: 'vegadresse',
              label: 'Vegadresse',
            },
            {
              value: 'postboksadresse',
              label: 'Postboksadresse',
            },
          ],
          validate: {
            required: true,
          },
          conditional: {
            show: true,
            when: 'borDuINorge',
            eq: 'ja',
          },
        },
        {
          legend: 'Kontaktadresse',
          key: 'navSkjemagruppeVegadresse',
          type: 'navSkjemagruppe',
          label: 'Kontaktadresse', // TODO: Kan slettes?
          input: false,
          tableView: false,
          conditional: {
            show: true,
            when: 'vegadresseEllerPostboksadresse',
            eq: 'vegadresse',
          },
          components: [
            norskVegadresseSchema(keyPostfix),
            {
              label: 'Fra hvilken dato skal denne adressen brukes (dd.mm.åååå)?',
              visArvelger: true,
              key: 'gyldigFraDatoDdMmAaaa1',
              type: 'navDatepicker',
              tableView: false,
              mayBeEqual: false,
              validateOn: 'blur',
              validate: {
                required: true,
                custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
              },
            },
            {
              label: 'Til hvilken dato skal denne adressen brukes (dd.mm.åååå)?',
              visArvelger: true,
              key: 'gyldigTilDatoDdMmAaaa1',
              type: 'navDatepicker',
              tableView: false,
              latestAllowedDate: 365,
              description:
                'Du velger selv hvor lenge adressen skal være gyldig, maksimalt 1 år. Etter 1 år må du endre eller forlenge adressen.',
              beforeDateInputKey: 'gyldigFraDatoDdMmAaaa1',
              mayBeEqual: false,
              validateOn: 'blur',
              validate: {
                custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
              },
            },
          ],
        },
        {
          legend: 'Kontaktadresse',
          key: 'navSkjemagruppePostboksadresse',
          type: 'navSkjemagruppe',
          label: 'Kontaktadresse',
          input: false,
          tableView: false,
          conditional: {
            show: true,
            when: 'vegadresseEllerPostboksadresse',
            eq: 'postboksadresse',
          },
          components: [
            norskPostboksadresseSchema(keyPostfix),
            {
              label: 'Fra hvilken dato skal denne adressen brukes (dd.mm.åååå)?',
              visArvelger: true,
              key: 'gyldigFraDatoDdMmAaaa2',
              type: 'navDatepicker',

              tableView: false,
              mayBeEqual: false,
              validateOn: 'blur',
              validate: {
                required: true,
                custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
              },
            },
            {
              label: 'Til hvilken dato skal denne adressen brukes (dd.mm.åååå)?',
              visArvelger: true,
              description:
                'Du velger selv hvor lenge adressen skal være gyldig, maksimalt 1 år. Etter 1 år må du endre eller forlenge adressen.',
              beforeDateInputKey: 'gyldigFraDatoDdMmAaaa2',
              mayBeEqual: false,
              validate: {
                custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
              },
              validateOn: 'blur',
              key: 'gyldigTilDatoDdMmAaaa2',
              type: 'navDatepicker',
              tableView: false,
              latestAllowedDate: 365,
            },
          ],
        },
        {
          legend: 'Utenlandsk kontaktadresse',
          key: 'navSkjemagruppeUtland',
          type: 'navSkjemagruppe',
          label: 'Utenlandsk kontaktadresse',
          input: false,
          tableView: false,
          conditional: {
            show: true,
            when: 'borDuINorge',
            eq: 'nei',
          },
          components: [
            utenlandskAdresseSchema(keyPostfix),
            {
              label: 'Fra hvilken dato skal denne adressen brukes (dd.mm.åååå)?',
              visArvelger: true,
              key: 'gyldigFraDatoDdMmAaaa',
              type: 'navDatepicker',
              tableView: false,
              mayBeEqual: false,
              validateOn: 'blur',
              validate: {
                required: true,
                custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
              },
            },
            {
              label: 'Til hvilken dato skal denne adressen brukes (dd.mm.åååå)?',
              visArvelger: true,
              key: 'gyldigTilDatoDdMmAaaa',
              type: 'navDatepicker',
              tableView: false,
              description:
                'Du velger selv hvor lenge adressen skal være gyldig, maksimalt 1 år. Etter 1 år må du endre eller forlenge adressen.',
              beforeDateInputKey: 'gyldigFraDatoDdMmAaaa',
              mayBeEqual: false,
              validateOn: 'blur',
              validate: {
                required: true,
                custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
              },
            },
          ],
        },
      ],
    },
  };
};

export default yourInformationBuilder;
