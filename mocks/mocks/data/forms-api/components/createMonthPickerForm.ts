import { monthPicker, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const createMonthPickerForm = () => {
  const formNumber = 'monthpicker';

  return form({
    title: 'MonthPicker component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          monthPicker(),
          monthPicker({
            label: 'MonthPicker med beskrivelse',
            description: '<p>Beskrivelse</p>',
            additionalDescriptionText: '<p>Utvidet beskrivelse</p>',
            additionalDescriptionLabel: 'mer',
          }),
        ],
      }),
      panel({
        title: 'Validering',
        components: [
          monthPicker({ label: 'MonthPicker påkrevd', validate: { required: true } }),
          monthPicker({ label: 'MonthPicker 2020 og senere', validate: { minYear: 2020 } }),
          monthPicker({ label: 'MonthPicker 2030 og tidligere', validate: { maxYear: 2030 } }),
          monthPicker({ label: 'MonthPicker senere enn 5 år tilbake i tid', earliestAllowedDate: -5 }),
          monthPicker({ label: 'MonthPicker tidligere enn om 4 år', latestAllowedDate: 4 }),
        ],
      }),
    ],
  });
};

const monthPickerTranslations = () => getMockTranslationsFromForm(createMonthPickerForm());

export { createMonthPickerForm, monthPickerTranslations };
