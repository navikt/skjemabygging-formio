import { checkbox, dataGrid, panel, phoneNumber } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const phoneNumberDeprecatedForm = () =>
  form({
    title: 'Tlfnr',
    formNumber: 'phonenumberareacode',
    path: 'phonenumberareacode',
    components: [
      panel({
        key: 'dineOpplysninger',
        title: 'Dine opplysninger',
        components: [
          phoneNumber({
            key: 'telefonnummer1',
            label: 'Telefonnummer med landskode',
          }),
          phoneNumber({
            key: 'telefonnummer2',
            label: 'Telefonnummer',
          }),
          phoneNumber({
            key: 'telefonnummer3',
            label: 'Telefonnummer ikke påkrevd',
          }),
        ],
      }),
      panel({
        key: 'telefonnummerOgDatagrid',
        title: 'Telefonnummer og datagrid',
        components: [
          phoneNumber({
            key: 'telefonnummerUtenforDatagrid',
            label: 'Telefonnummer utenfor datagrid',
          }),
          dataGrid({
            key: 'datagrid',
            label: 'Repeterende data',
            components: [
              phoneNumber({
                key: 'telefonnummerInniDatagrid',
                label: 'Telefonnummer inni datagrid',
              }),
            ],
          }),
        ],
      }),
      panel({
        key: 'valideringAvSkjultTelefonnummer',
        title: 'Validering av skjult telefonnummer',
        components: [
          phoneNumber({
            conditional: {
              show: false,
              when: 'harIkkeTelefonnummer',
              eq: 'true',
            },
            key: 'telefonnummer4',
            label: 'Telefonnummer',
          }),
          checkbox({
            defaultValue: false,
            key: 'harIkkeTelefonnummer',
            label: 'Har ikke telefonnummer',
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: 'phonenumberareacode', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const phoneNumberDeprecatedTranslations = () => getMockTranslationsFromForm(phoneNumberDeprecatedForm());

export { phoneNumberDeprecatedForm, phoneNumberDeprecatedTranslations };
