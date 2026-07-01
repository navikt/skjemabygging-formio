import { attachment, monthPicker, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const monthPickerDeprecatedForm = () =>
  form({
    title: 'Monthpicker test',
    formNumber: 'monthpickertest',
    path: 'monthpickertest',
    components: [
      panel({
        key: 'veiledning',
        title: 'Veiledning',
        components: [
          monthPicker({
            key: 'requiredMonthPicker',
            label: 'Required monthPicker',
          }),
          monthPicker({
            key: 'minMaxMonthPicker',
            label: 'Min/max monthPicker',
          }),
          monthPicker({
            key: 'relativeMonthPicker',
            label: 'Relative monthPicker',
          }),
          monthPicker({
            key: 'relativeMonthPickerWithTodayAsBase',
            label: 'Relative monthPicker (with today as base)',
          }),
          monthPicker({
            key: 'monthpickerWithRangeInThePast',
            label: 'MonthPicker with range in the past',
          }),
        ],
      }),
      panel({
        isAttachmentPanel: true,
        key: 'vedlegg',
        title: 'Vedlegg',
        components: [
          attachment({
            attachmentType: 'other',
            attachmentValues: {
              leggerVedNaa: {
                enabled: true,
              },
              ettersender: {
                enabled: true,
              },
              nei: {
                enabled: true,
              },
            },
            description: 'Har du noen annen dokumentasjon du ønsker å legge ved?',
            key: 'annenDokumentasjon',
            label: 'Annen dokumentasjon',
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: 'monthpickertest', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const monthPickerDeprecatedTranslations = () => getMockTranslationsFromForm(monthPickerDeprecatedForm());

export { monthPickerDeprecatedForm, monthPickerDeprecatedTranslations };
