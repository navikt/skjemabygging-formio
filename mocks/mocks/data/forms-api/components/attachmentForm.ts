import { attachment, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const attachmentTestForm = () => {
  const formNumber = 'attachment';

  return form({
    title: 'Attachment component test form',
    formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          attachment({
            key: 'vedlegg1',
            attachmentType: 'default',
          }),
          attachment({
            key: 'vedlegg2',
            attachmentType: 'default',
            label: 'Vedlegg med beskrivelse',
            description: '<p>Dette er en beskrivelse</p>',
            additionalDescriptionText: '<p>Dette er utvidet beskrivelse</p>',
            additionalDescriptionLabel: 'mer',
          }),
        ],
      }),
      panel({
        title: 'Annet',
        components: [
          attachment({
            key: 'annenDokumentasjon',
            attachmentType: 'other',
          }),
        ],
      }),
      panel({
        title: 'Validering',
        components: [
          attachment({
            key: 'vedleggPakrevd',
            attachmentType: 'default',
            label: 'Vedlegg påkrevd',
          }),
          attachment({
            key: 'vedleggIkkePakrevd',
            attachmentType: 'default',
            label: 'Vedlegg ikke påkrevd',
            validate: { required: false },
          }),
        ],
      }),
    ],
  });
};

const attachmentTranslations = () => {
  const translations = getMockTranslationsFromForm(attachmentTestForm());

  return {
    ...translations,
    data: {
      ...translations.data,
      i18n: {
        ...translations.data.i18n,
        Vedlegg: 'Vedlegg (en)',
      },
    },
  };
};
export { attachmentTestForm, attachmentTranslations };
