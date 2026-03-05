import { panel, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const panelTestForm = () => {
  const formNumber = 'panel';

  return form({
    title: 'Panel component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Oversiktsside',
        components: [textField({ label: 'Tekstfelt' })],
      }),
      panel({
        title: 'Vedlegg',
        isAttachmentPanel: true,
        components: [textField({ label: 'Vedleggsfelt' })],
      }),
    ],
  });
};

const panelTranslations = () => getMockTranslationsFromForm(panelTestForm());

export { panelTestForm, panelTranslations };
