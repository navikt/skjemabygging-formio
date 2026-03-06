import { datePicker, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const datePickerForm = () => {
  const formNumber = 'datepicker';

  return form({
    title: 'DatePicker component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          datePicker({
            label: 'Dato (dd.mm.åååå)',
          }),
          datePicker({
            label: 'Dato med beskrivelse',
            description: '<p>Velg ønsket dato</p>',
          }),
          datePicker({
            label: 'Dato med tilleggsbeskrivelse',
            additionalDescriptionLabel: 'Mer informasjon',
            additionalDescriptionText: '<p>Utvidet informasjon om dato</p>',
          }),
        ],
      }),
      panel({
        title: 'Validering',
        components: [
          datePicker({
            label: 'Dato påkrevd',
            validate: { required: true },
          }),
          datePicker({
            label: 'Dato ikke påkrevd',
            validate: { required: false },
          }),
          {
            ...datePicker({ label: 'Dato fra og med 10.01.2025' }),
            specificEarliestAllowedDate: '2025-01-10',
          },
          {
            ...datePicker({ label: 'Dato til og med 20.01.2025' }),
            specificLatestAllowedDate: '2025-01-20',
          },
        ],
      }),
    ],
  });
};

const datePickerTranslations = () => getMockTranslationsFromForm(datePickerForm());

export { datePickerForm, datePickerTranslations };
