import { image, panel, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const imageForm = () => {
  const formNumber = 'image';

  return form({
    title: 'Image component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          // Images keep the builder default validate.required: true, like the published forms do.
          image({ label: 'Bilde', altText: 'Test bilde' }),
          image({ label: 'Bilde med bredde', altText: 'Halvt bilde', widthPercent: 50 }),
          image({ label: 'Bilde med beskrivelse', altText: 'Bilde med tekst', description: '<p>Bildetekst</p>' }),
          textField({ label: 'Tekstfelt', validate: { required: false } }),
        ],
      }),
    ],
  });
};

const imageTranslations = () => getMockTranslationsFromForm(imageForm());

export { imageForm, imageTranslations };
