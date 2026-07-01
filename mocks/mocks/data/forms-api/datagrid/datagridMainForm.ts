import {
  accountNumber,
  dataGrid,
  iban,
  nationalIdentityNumber,
  organizationNumber,
  panel,
  textField,
} from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const datagridMainForm = () =>
  form({
    title: 'Testskjema med datagrid',
    formNumber: 'datagrid123',
    path: 'datagrid123',
    components: [
      panel({
        key: 'datagridMedValgfrieFelter',
        title: 'Datagrid med valgfrie felter',
        components: [
          dataGrid({
            key: 'valgfrieFelter1',
            label: 'Valgfrie felter',
            components: [
              textField({
                key: 'tekstfelt',
                label: 'Tekstfelt',
              }),
              nationalIdentityNumber({
                key: 'fodselsnummerDNummer',
                label: 'Fødselsnummer eller d-nummer',
                validate: {
                  required: false,
                  custom: 'valid = instance.validateFnrNew(input)',
                },
              }),
              accountNumber({
                key: 'kontoNummer',
                label: 'Kontonummer',
                validate: {
                  required: false,
                  custom: 'valid = instance.validateAccountNumber(input)',
                },
              }),
              iban({
                key: 'iban',
                label: 'IBAN',
                validate: {
                  required: false,
                  custom: 'valid = instance.validateIban(input);',
                },
              }),
              organizationNumber({
                key: 'orgNr',
                label: 'Organisasjonsnummer',
                validate: {
                  required: false,
                  custom: 'valid = instance.validateOrganizationNumber(input)',
                },
              }),
            ],
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: 'datagrid123', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const datagridMainTranslations = () => getMockTranslationsFromForm(datagridMainForm());

export { datagridMainForm, datagridMainTranslations };
