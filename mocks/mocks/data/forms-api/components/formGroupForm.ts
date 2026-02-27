import { formGroup, panel, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const formGroupTestForm = () => {
  const formNumber = 'formgroup';

  return form({
    title: 'FormGroup component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          formGroup({
            label: 'Skjemagruppe',
            key: 'skjemagruppe1',
            components: [textField({ label: 'Tekstfelt i gruppe' })],
          }),
          formGroup({
            label: 'Skjemagruppe med beskrivelse',
            key: 'skjemagruppe2',
            description: '<p>Dette er en beskrivelse av gruppen</p>',
            components: [textField({ label: 'Tekstfelt i gruppe med beskrivelse' })],
          }),
          formGroup({
            label: 'Skjemagruppe uten bakgrunnsfarge',
            key: 'skjemagruppe3',
            backgroundColor: false,
            components: [textField({ label: 'Tekstfelt i gruppe uten bakgrunnsfarge' })],
          }),
        ],
      }),
    ],
  });
};

const formGroupTranslations = () => getMockTranslationsFromForm(formGroupTestForm());

export { formGroupTestForm, formGroupTranslations };
