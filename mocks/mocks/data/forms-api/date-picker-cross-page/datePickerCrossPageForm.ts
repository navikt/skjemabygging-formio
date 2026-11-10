import { datePicker, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const datePickerCrossPageForm = () =>
  form({
    title: 'Cross-page date references',
    formNumber: 'datepickercrosspage',
    path: 'datepickercrosspage',
    components: [
      panel({
        key: 'start',
        title: 'Start',
        components: [datePicker({ key: 'startDate', label: 'Start date', validate: { required: true } })],
      }),
      panel({
        key: 'end',
        title: 'End',
        components: [
          datePicker({
            key: 'endDate',
            label: 'End date',
            beforeDateInputKey: 'startDate',
            mayBeEqual: false,
          }),
          datePicker({
            key: 'inclusiveEndDate',
            label: 'Inclusive end date',
            beforeDateInputKey: 'startDate',
            mayBeEqual: true,
          }),
        ],
      }),
    ],
  });

const datePickerCrossPageTranslations = () => getMockTranslationsFromForm(datePickerCrossPageForm());

export { datePickerCrossPageForm, datePickerCrossPageTranslations };
