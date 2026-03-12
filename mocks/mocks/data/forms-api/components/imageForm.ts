import { image, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

// A minimal 1x1 px transparent PNG used as test image data
const TEST_IMAGE_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

const imageData = [
  {
    url: TEST_IMAGE_URL,
    hash: '',
    name: 'test-bilde.png',
    size: 68,
    type: 'image/png',
    storage: 'base64',
    originalName: 'test-bilde.png',
  },
];

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
          {
            ...image({ label: 'Bilde' }),
            image: imageData,
            altText: 'Test bilde',
            widthPercent: 100,
          },
          {
            ...image({ label: 'Bilde med bredde' }),
            image: imageData,
            altText: 'Halvt bilde',
            widthPercent: 50,
          },
          {
            ...image({ label: 'Bilde med beskrivelse', description: '<p>Bildetekst</p>' }),
            image: imageData,
            altText: 'Bilde med tekst',
            widthPercent: 100,
          },
        ],
      }),
    ],
  });
};

const imageTranslations = () => getMockTranslationsFromForm(imageForm());

export { imageForm, imageTranslations };
