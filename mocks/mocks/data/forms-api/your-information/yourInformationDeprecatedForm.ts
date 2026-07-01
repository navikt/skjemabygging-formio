import {
  address,
  addressValidity,
  alert,
  container,
  firstName,
  identity,
  panel,
  surname,
  textField,
} from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const yourInformationDeprecatedForm = () =>
  form({
    title: 'Test dine opplysninger',
    formNumber: 'yourinformation',
    path: 'yourinformation',
    components: [
      panel({
        key: 'dineOpplysninger',
        title: 'Dine opplysninger',
        components: [
          container({
            key: 'dineOpplysninger',
            label: 'Dine opplysninger',
            components: [
              firstName({
                key: 'fornavn',
                label: 'Fornavn',
                prefill: true,
                prefillKey: 'sokerFornavn',
                protectedApiKey: true,
              }),
              surname({
                key: 'etternavn',
                label: 'Etternavn',
                prefill: true,
                prefillKey: 'sokerEtternavn',
                protectedApiKey: true,
              }),
              identity({
                key: 'identitet',
                label: 'Identitet',
                prefill: true,
              }),
              address({
                customConditional:
                  'show = row.identitet.harDuFodselsnummer === "nei" || (row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer)',
                key: 'adresse',
                label: 'Adresse',
                prefill: true,
                prefillKey: 'sokerAdresser',
                protectedApiKey: true,
              }),
              addressValidity({
                customConditional:
                  'show = row.adresse.borDuINorge === "nei" || (row.adresse.borDuINorge === "ja" && row.adresse.vegadresseEllerPostboksadresse)',
                key: 'adresseVarighet',
                label: 'Adresse varighet',
                protectedApiKey: true,
              }),
              alert({
                content:
                  '<p>Nav sender svar på søknad og annen kommunikasjon til din folkeregistrerte adresse. Du kan <a href="https://www.skatteetaten.no/person/folkeregister/flytte/endre-postadresse/" target="_blank" rel="noopener noreferrer">sjekke og endre din folkeregistrerte adresse på skatteetatens nettsider (åpnes i ny fane)</a>.</p>',
                customConditional: 'show = row.identitet.harDuFodselsnummer === "ja"',
                key: 'alertstripe',
              }),
              alert({
                content:
                  '<p>Adressen er hentet fra Folkeregisteret. Du kan <a href="https://www.skatteetaten.no/person/folkeregister/flytte/endre-postadresse/" target="_blank" rel="noopener noreferrer"> endre adressen på Skatteetatens nettsider (åpnes i ny fane)</a>.</p>',
                customConditional: 'show = row.identitet.identitetsnummer && !row.identitet.harDuFodselsnummer',
                key: 'alertstripePrefill',
              }),
            ],
          }),
        ],
      }),
      panel({
        key: 'navn',
        title: 'Navn',
        components: [
          textField({
            autocomplete: 'given-name',
            key: 'fornavn1',
            label: 'Fornavn',
            prefillKey: 'sokerFornavn',
          }),
          textField({
            autocomplete: 'family-name',
            key: 'etternavn1',
            label: 'Etternavn',
            prefillKey: 'sokerEtternavn',
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: 'yourinformation', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const yourInformationDeprecatedTranslations = () => getMockTranslationsFromForm(yourInformationDeprecatedForm());

export { yourInformationDeprecatedForm, yourInformationDeprecatedTranslations };
