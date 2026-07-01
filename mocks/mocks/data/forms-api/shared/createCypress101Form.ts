import {
  address,
  addressValidity,
  alert,
  attachment,
  firstName,
  htmlElement,
  identity,
  monthPicker,
  navSelect,
  panel,
  surname,
} from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { formIntroPageWithoutSelfDeclaration } from '../../../form-builder/form/formIntroPage';
import formProperties from '../../../form-builder/form/formProperties';

interface CreateCypress101FormOptions {
  path: string;
}

const createIdentityWithCapitalD = () => {
  const identityComponent = identity({ prefill: true });
  return {
    ...identityComponent,
    customLabels: {
      ...identityComponent.customLabels,
      doYouHaveIdentityNumber: 'Har du norsk fødselsnummer eller D-nummer?',
    },
  };
};

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
          createIdentityWithCapitalD(),
          address({
            prefill: true,
            prefillKey: 'sokerAdresser',
            protectedApiKey: true,
            customConditional:
              'show = data.identitet.harDuFodselsnummer === "nei" || (data.identitet.identitetsnummer && !data.identitet.harDuFodselsnummer)',
          }),
          addressValidity({
            protectedApiKey: true,
            customConditional:
              'show = data.adresse.borDuINorge === "nei" || (data.adresse.borDuINorge === "ja" && data.adresse.vegadresseEllerPostboksadresse)',
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
