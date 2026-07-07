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
            showAreaCode: true,
            validate: { required: true },
          }),
          phoneNumber({
            key: 'telefonnummer2',
            label: 'Telefonnummer',
            showAreaCode: false,
            validate: { required: true },
          }),
          phoneNumber({
            key: 'telefonnummer3',
            label: 'Telefonnummer ikke påkrevd',
            showAreaCode: false,
            validate: { required: false },
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
            showAreaCode: true,
            validate: { required: false },
          }),
          dataGrid({
            key: 'datagrid',
            label: 'Repeterende data',
            validate: { required: true },
            components: [
              phoneNumber({
                key: 'telefonnummerInniDatagrid',
                label: 'Telefonnummer inni datagrid',
                showAreaCode: true,
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
            validate: { required: true, minLength: 8 },
          }),
          checkbox({
            defaultValue: false,
            key: 'harIkkeTelefonnummer',
            label: 'Har ikke telefonnummer',
            validate: { required: false },
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: 'phonenumberareacode', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const phoneNumberDeprecatedTranslations = () => getMockTranslationsFromForm(phoneNumberDeprecatedForm());

export { phoneNumberDeprecatedForm, phoneNumberDeprecatedTranslations };
