import { attachment, monthPicker, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { formIntroPageWithoutSelfDeclaration } from '../../../form-builder/form/formIntroPage';
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
            validate: { required: true },
          }),
          monthPicker({
            key: 'minMaxMonthPicker',
            label: 'Min/max monthPicker',
            validate: { required: false, minYear: 2020, maxYear: 2024 },
          }),
          monthPicker({
            key: 'relativeMonthPicker',
            label: 'Relative monthPicker',
            earliestAllowedDate: -5,
            latestAllowedDate: 3,
            validate: { required: false },
          }),
          monthPicker({
            key: 'relativeMonthPickerWithTodayAsBase',
            label: 'Relative monthPicker (with today as base)',
            earliestAllowedDate: -9,
            latestAllowedDate: 0,
            validate: { required: false },
          }),
          monthPicker({
            key: 'monthpickerWithRangeInThePast',
            label: 'MonthPicker with range in the past',
            validate: { required: false, minYear: 1995, maxYear: 2003 },
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
    introPage: formIntroPageWithoutSelfDeclaration(),
    properties: formProperties({ formNumber: 'monthpickertest', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const monthPickerDeprecatedTranslations = () => getMockTranslationsFromForm(monthPickerDeprecatedForm());

export { monthPickerDeprecatedForm, monthPickerDeprecatedTranslations };
