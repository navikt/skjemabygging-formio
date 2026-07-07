import {
  accountNumber,
  currency,
  iban,
  nationalIdentityNumber,
  organizationNumber,
  panel,
} from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { formIntroPageWithoutSelfDeclaration } from '../../../form-builder/form/formIntroPage';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const textfieldFormattingForm = () =>
  form({
    title: 'Kort skjema',
    formNumber: 'Kort skjema',
    path: 'kortskjema',
    components: [
      panel({
        key: 'veiledning',
        title: 'Veiledning',
        components: [
          iban({
            key: 'iban',
            label: 'IBAN',
            validate: { required: true },
          }),
          accountNumber({
            key: 'kontoNummer',
            label: 'Kontonummer',
            validate: {
              required: true,
              custom: 'valid = instance.validateAccountNumber(input)',
            },
          }),
          nationalIdentityNumber({
            key: 'fodselsnummerDNummer',
            label: 'Fødselsnummer eller d-nummer',
            validate: { required: true },
          }),
          organizationNumber({
            key: 'orgNr',
            label: 'Organisasjonsnummer',
            validate: {
              required: true,
              custom: 'valid = instance.validateOrganizationNumber(input)',
            },
          }),
          currency({
            key: 'belop',
            label: 'Beløp heltall',
            inputType: 'numeric',
            validate: { required: true },
          }),
          currency({
            key: 'belopDesimaltall1',
            label: 'Beløp desimaltall',
            validate: { required: true },
          }),
        ],
      }),
      panel({
        key: 'dineOpplysninger',
        title: 'Dine opplysninger',
        components: [],
      }),
      panel({
        isAttachmentPanel: true,
        key: 'vedlegg',
        title: 'Vedlegg',
        components: [],
      }),
    ],
    introPage: formIntroPageWithoutSelfDeclaration(),
    properties: formProperties({ formNumber: 'Kort skjema', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const textfieldFormattingTranslations = () => getMockTranslationsFromForm(textfieldFormattingForm());

export { textfieldFormattingForm, textfieldFormattingTranslations };
