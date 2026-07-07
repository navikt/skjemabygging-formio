import {
  alert,
  attachment,
  container,
  datePicker,
  firstName,
  formGroup,
  htmlElement,
  monthPicker,
  nationalIdentityNumber,
  navSelect,
  panel,
  radio,
  surname,
  textField,
} from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { formIntroPageWithoutSelfDeclaration } from '../../../form-builder/form/formIntroPage';
import formProperties from '../../../form-builder/form/formProperties';

interface CreateCypress101FormOptions {
  path: string;
}

const identityChoiceKey = 'harDuNorskFodselsnummerEllerDNummer';

const createCypress101Form = ({ path }: CreateCypress101FormOptions) =>
  form({
    title: 'Skjema for Cypress-testing',
    formNumber: 'CYPRESS-101',
    path,
    components: [
      panel({
        title: 'Veiledning',
        key: 'veiledning',
        components: [
          htmlElement({ key: 'veiledningstekst', content: 'Her skal det stå litt informasjon om søknaden' }),
        ],
      }),
      panel({
        title: 'Dine opplysninger',
        key: 'dineOpplysninger',
        components: [
          navSelect({
            key: 'oppgiTittel',
            label: 'Tittel',
            validate: { required: true },
            values: [
              { label: 'Herr', value: 'herr' },
              { label: 'Fru', value: 'fru' },
              { label: 'Frøken', value: 'froeken' },
            ],
          }),
          firstName({ key: 'fornavn', prefill: true, prefillKey: 'sokerFornavn', protectedApiKey: true }),
          surname({ key: 'etternavn', prefill: true, prefillKey: 'sokerEtternavn', protectedApiKey: true }),
          radio({
            key: identityChoiceKey,
            label: 'Har du norsk fødselsnummer eller D-nummer?',
            customConditional: `show = !data.fodselsnummerDNummerSoker || data.${identityChoiceKey}`,
            validate: { required: true },
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          nationalIdentityNumber({
            key: 'fodselsnummerDNummerSoker',
            label: 'Fødselsnummer eller d-nummer',
            customConditional: `show = data.${identityChoiceKey} === "ja" || (data.fodselsnummerDNummerSoker && !data.${identityChoiceKey})`,
            prefill: true,
            prefillKey: 'sokerIdentifikasjonsnummer',
            protectedApiKey: true,
            mask: false,
            inputFormat: 'plain',
            inputMask: '',
            displayMask: '',
            truncateMultipleSpaces: false,
            validate: { required: true },
          }),
          datePicker({
            conditional: { show: true, when: identityChoiceKey, eq: 'nei' },
            key: 'fodselsdatoDdMmAaaaSoker',
            label: 'Fødselsdato (dd.mm.åååå)',
            validate: {
              custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
            },
          }),
          radio({
            conditional: { show: true, when: identityChoiceKey, eq: 'nei' },
            key: 'borDuINorge',
            label: 'Bor du i Norge?',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          radio({
            conditional: { show: true, when: 'borDuINorge', eq: 'ja' },
            key: 'vegadresseEllerPostboksadresse',
            label: 'Er kontaktadressen en vegadresse eller postboksadresse?',
            values: [
              { label: 'Vegadresse', value: 'vegadresse' },
              { label: 'Postboksadresse', value: 'postboksadresse' },
            ],
          }),
          formGroup({
            conditional: { show: true, when: 'vegadresseEllerPostboksadresse', eq: 'vegadresse' },
            key: 'navSkjemagruppeVegadresse',
            label: 'Kontaktadresse',
            legend: 'Kontaktadresse',
            components: [
              container({
                hideLabel: true,
                key: 'norskVegadresse',
                label: 'Kontaktadresse',
                components: [
                  textField({ key: 'vegadresseSoker', label: 'Vegadresse' }),
                  textField({ key: 'postnrSoker', label: 'Postnummer' }),
                  textField({ key: 'poststedSoker', label: 'Poststed' }),
                ],
              }),
              datePicker({
                key: 'gyldigFraDatoDdMmAaaa1',
                label: 'Gyldig fra (dd.mm.åååå)',
                validate: {
                  custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
                },
              }),
            ],
          }),
          monthPicker({ key: 'velgMaaned', label: 'Velg måned' }),
          alert({
            key: 'eksempelOversettelse1',
            content: '<span>Eksempel</span> Oversettelse',
          }),
          alert({
            key: 'eksempelOversettelse2',
            content: '<span>Eksempel</span> <span>Oversettelse</span>',
          }),
        ],
      }),
      panel({
        title: 'Vedlegg',
        key: 'vedlegg',
        isAttachmentPanel: true,
        components: [attachment({ key: 'annenDokumentasjon', attachmentType: 'other', validate: { required: true } })],
      }),
    ],
    properties: formProperties({
      formNumber: 'CYPRESS-101',
      submissionTypes: ['PAPER', 'DIGITAL'],
    }),
    introPage: formIntroPageWithoutSelfDeclaration(),
  });

const createCypress101Translations = (path: string) => ({
  _id: '123',
  data: {
    scope: 'local',
    form: path,
    language: 'en',
    i18n: {
      'Skjema for Cypress-testing': 'Form for Cypress testing',
      Veiledning: 'Guidance',
      'Dine opplysninger': 'Your information',
      'Her skal det stå litt informasjon om søknaden': 'Info about the application',
      Fornavn: 'First name',
      Etternavn: 'Last name',
      Tittel: 'Title',
      Herr: 'Mr',
      Fru: 'Mrs',
      Frøken: 'Ms',
      'Har du norsk fødselsnummer eller D-nummer?':
        'Do you have a Norwegian national identification number or d number?',
      'Fødselsnummer / D-nummer': 'Norwegian national identification / D number',
      Oppsummering: 'Summary',
      'Annen dokumentasjon': 'Other documentation',
      'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved.': 'No, I have no other documentation.',
      '<span>Eksempel</span> Oversettelse': 'Example correct translation',
      '<span>Eksempel</span> <span>Oversettelse</span>': 'Example correct translation',
      Eksempel: 'Example',
      Oversettelse: 'Translation',
    },
  },
});

export { createCypress101Form, createCypress101Translations };
