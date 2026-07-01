import {
  alert,
  checkbox,
  container,
  countrySelect,
  currency,
  dataGrid,
  datePicker,
  email,
  formGroup,
  htmlElement,
  iban,
  image,
  nationalIdentityNumber,
  navSelect,
  number,
  organizationNumber,
  panel,
  phoneNumber,
  radio,
  select,
  selectBoxes,
  textArea,
  textField,
} from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { formIntroPageWithoutSelfDeclaration } from '../../../form-builder/form/formIntroPage';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const a11yAxeForm = () =>
  form({
    title: 'Axe testing i Cypress',
    formNumber: 'cypressaxe',
    path: 'cypressaxe',
    components: [
      panel({
        key: 'veiledning',
        title: 'Person',
        components: [
          nationalIdentityNumber({
            key: 'fodselsnummerDNummer',
            label: 'Fødselsnummer / D-nummer',
            validate: {
              custom: 'valid = instance.validateFnrNew(input)',
            },
          }),
          textField({
            autocomplete: 'given-name',
            key: 'fornavn',
            label: 'Fornavn',
          }),
          textField({
            autocomplete: 'family-name',
            key: 'etternavn',
            label: 'Etternavn',
          }),
          container({
            hideLabel: true,
            key: 'norskVegadresse1',
            label: 'Kontaktadresse',
            components: [
              textField({
                key: 'co',
                label: 'C/O',
              }),
              textField({
                autocomplete: 'street-address',
                key: 'vegadresse',
                label: 'Vegadresse',
              }),
              textField({
                autocomplete: 'postal-code',
                key: 'postnr',
                label: 'Postnummer',
              }),
              textField({
                autocomplete: 'address-level2',
                key: 'poststed',
                label: 'Poststed',
              }),
            ],
          }),
          container({
            hideLabel: true,
            key: 'norskPostboksadresse1',
            label: 'Postboksadresse',
            components: [
              textField({
                key: 'co',
                label: 'C/O',
              }),
              textField({
                key: 'postboksNr',
                label: 'Postboks',
              }),
              textField({
                autocomplete: 'postal-code',
                key: 'postnr',
                label: 'Postnummer',
              }),
              textField({
                autocomplete: 'address-level2',
                key: 'poststed',
                label: 'Poststed',
              }),
            ],
          }),
          container({
            hideLabel: true,
            key: 'utenlandskAdresse1',
            label: 'Utenlandsk kontaktadresse',
            components: [
              textField({
                key: 'co',
                label: 'C/O',
              }),
              textField({
                autocomplete: 'street-address',
                key: 'postboksNr',
                label: 'Vegnavn og husnummer, eller postboks',
              }),
              textField({
                key: 'bygning',
                label: 'Bygning',
              }),
              textField({
                autocomplete: 'postal-code',
                key: 'postnr',
                label: 'Postkode',
              }),
              textField({
                autocomplete: 'address-level2',
                key: 'poststed',
                label: 'By / stedsnavn',
              }),
              textField({
                autocomplete: 'address-level1',
                key: 'region',
                label: 'Region',
              }),
              textField({
                autocomplete: 'country-name',
                key: 'land',
                label: 'Land',
              }),
            ],
          }),
          textField({
            autocomplete: 'street-address',
            key: 'vegadresse',
            label: 'Vegadresse',
          }),
          textField({
            autocomplete: 'postal-code',
            key: 'postnr',
            label: 'Postnummer',
          }),
          textField({
            autocomplete: 'address-level2',
            key: 'poststed',
            label: 'Poststed',
          }),
          textField({
            autocomplete: 'country-name',
            key: 'land',
            label: 'Land',
          }),
          countrySelect({
            key: 'landvelger',
            label: 'Velg land',
          }),
          email({
            key: 'epost',
            label: 'E-post',
          }),
          phoneNumber({
            key: 'telefonnummer',
            label: 'Telefonnummer',
          }),
          textField({
            key: 'statsborgerskap',
            label: 'Statsborgerskap',
          }),
        ],
      }),
      panel({
        key: 'dineOpplysninger',
        title: 'Penger og konto',
        components: [
          currency({
            key: 'belop',
            label: 'Beløp',
          }),
          textField({
            key: 'kontoNummer',
            label: 'Kontonummer',
          }),
          iban({
            key: 'iban',
            label: 'IBAN',
            validate: {
              custom: 'valid = instance.validateIban(input);',
            },
          }),
        ],
      }),
      panel({
        key: 'bedriftOrganisasjon',
        title: 'Bedrift / organisasjon',
        components: [
          organizationNumber({
            key: 'orgNr',
            label: 'Organisasjonsnummer',
            validate: {
              custom: 'valid = instance.validateOrganizationNumber(input)',
            },
          }),
          textField({
            key: 'arbeidsgiver',
            label: 'Arbeidsgiver',
          }),
        ],
      }),
      panel({
        key: 'page4',
        title: 'Dato og tid',
        components: [
          datePicker({
            key: 'datoDdMmAaaa',
            label: 'Dato (dd.mm.åååå)',
            validate: {
              custom: 'valid = instance.validateDatePickerV2(input, data, component, row);',
            },
          }),
          textField({
            key: 'tid',
            label: 'Klokkeslett (tt:mm)',
          }),
          {
            type: 'day',
            key: 'manedAr',
            label: 'Måned og år',
            input: true,
          },
        ],
      }),
      panel({
        key: 'page5',
        title: 'Standard felter',
        components: [
          textField({
            key: 'tekstfelt',
            label: 'Tekstfelt',
          }),
          textArea({
            key: 'textarea',
            label: 'Tekstområde',
          }),
          number({
            key: 'number',
            label: 'Tall',
          }),
          number({
            key: 'prosent',
            label: 'Prosent',
            suffix: '%',
          }),
          checkbox({
            key: 'Avkryssingsboks',
            label: 'Avkryssingsboks',
          }),
          selectBoxes({
            key: 'flervalg',
            label: 'Flervalg',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          select({
            key: 'nedtrekksmeny',
            label: 'Nedtrekksmeny (formio)',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
            widget: 'choicesjs',
          }),
          navSelect({
            key: 'velgFrukt',
            label: 'Nedtrekksmeny (Nav)',
            values: [
              { label: 'Eple', value: 'eple' },
              { label: 'Banan', value: 'banan' },
              { label: 'Persimon', value: 'persimon' },
            ],
          }),
          radio({
            key: 'radiopanel',
            label: 'Radiopanel',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          radio({
            key: 'vedlegg',
            label: '< Navn på vedlegg > + husk å legge inn Gosys vedleggstittel og vedleggskode under API-fanen',
            values: [
              { label: 'Jeg legger det ved denne søknaden (anbefalt)', value: 'leggerVedNaa' },
              {
                label:
                  'Jeg ettersender dokumentasjonen senere (jeg er klar over at Nav ikke kan behandle søknaden før jeg har levert dokumentasjonen)',
                value: 'ettersender',
              },
              { label: 'Jeg har levert denne dokumentasjonen tidligere', value: 'levertTidligere' },
            ],
          }),
          image({
            key: 'image',
            label: 'Bilde',
          }),
        ],
      }),
      panel({
        key: 'page6',
        title: 'Layout',
        components: [
          htmlElement({
            key: 'html',
          }),
          alert({
            content: 'Info',
            key: 'alertstripe',
          }),
          alert({
            alerttype: 'success',
            content: 'Suksess',
            key: 'alertstripe1',
          }),
          alert({
            alerttype: 'warning',
            content: 'Advarsel',
            key: 'alertstripe2',
          }),
          alert({
            alerttype: 'error',
            content: 'Feil',
            key: 'alertstripe3',
          }),
          formGroup({
            key: 'navSkjemagruppe',
            label: 'Skjemagruppe',
            legend: 'Skjemagruppe',
            components: [
              panel({
                key: 'panel',
                title: 'Panel',
                components: [
                  htmlElement({
                    content: 'p tag',
                    key: 'html1',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      panel({
        key: 'page7',
        title: 'Data',
        components: [
          {
            type: 'hidden',
            key: 'hidden1',
            label: 'Hidden',
            input: true,
          },
          container({
            hideLabel: true,
            key: 'container',
            label: 'Container',
            components: [
              dataGrid({
                key: 'datagrid',
                label: 'Data Grid',
              }),
            ],
          }),
        ],
      }),
    ],
    properties: formProperties({
      formNumber: 'cypressaxe',
      submissionTypes: ['PAPER'],
    }),
    introPage: formIntroPageWithoutSelfDeclaration(),
  });

const a11yAxeTranslations = () => getMockTranslationsFromForm(a11yAxeForm());

export { a11yAxeForm, a11yAxeTranslations };
