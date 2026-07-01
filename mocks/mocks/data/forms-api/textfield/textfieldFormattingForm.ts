import {
  accountNumber,
  currency,
  iban,
  nationalIdentityNumber,
  organizationNumber,
  panel,
} from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
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
          }),
          accountNumber({
            key: 'kontoNummer',
            label: 'Kontonummer',
            validate: {
              custom: 'valid = instance.validateAccountNumber(input)',
            },
          }),
          nationalIdentityNumber({
            key: 'fodselsnummerDNummer',
            label: 'Fødselsnummer eller d-nummer',
          }),
          organizationNumber({
            key: 'orgNr',
            label: 'Organisasjonsnummer',
            validate: {
              custom: 'valid = instance.validateOrganizationNumber(input)',
            },
          }),
          currency({
            key: 'belop',
            label: 'Beløp heltall',
          }),
          currency({
            key: 'belopDesimaltall1',
            label: 'Beløp desimaltall',
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
    properties: formProperties({ formNumber: 'Kort skjema', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const textfieldFormattingTranslations = () => getMockTranslationsFromForm(textfieldFormattingForm());

export { textfieldFormattingForm, textfieldFormattingTranslations };
