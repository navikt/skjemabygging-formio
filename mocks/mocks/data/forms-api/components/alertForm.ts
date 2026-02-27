import { alert, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const alertForm = () => {
  const formNumber = 'alert';

  return form({
    title: 'Alert component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          alert({
            content: '<p>Info melding</p>',
            alerttype: 'info',
            textDisplay: 'form',
          }),
          alert({
            content: '<p>Advarsel melding</p>',
            alerttype: 'warning',
            textDisplay: 'form',
          }),
          alert({
            content: '<p>Suksess melding</p>',
            alerttype: 'success',
            textDisplay: 'formPdf',
          }),
          alert({
            content: '<p>Feil melding</p>',
            alerttype: 'error',
            textDisplay: 'form',
          }),
          alert({
            content: '<p>Inline melding</p>',
            isInline: true,
            textDisplay: 'form',
          }),
          // textDisplay: 'pdf' requires hidden: true (set by form builder calculateValue)
          {
            ...alert({
              content: '<p>Kun i PDF</p>',
              textDisplay: 'pdf',
            }),
            hidden: true,
          },
        ],
      }),
    ],
  });
};

const alertTranslations = () => {
  const formData = alertForm();
  const baseTrans = getMockTranslationsFromForm(formData);

  // getMockTranslationsFromForm does not handle the content field of alert,
  // so add content translations manually
  const insertLanguage = (value: string) => {
    const regex = /(<\/[^>]+>$)/;
    return regex.test(value) ? value.replace(regex, ' (en)$1') : `${value} (en)`;
  };

  formData.components.forEach((panelComp: any) => {
    panelComp.components?.forEach((comp: any) => {
      if (comp.type === 'alertstripe' && comp.content) {
        baseTrans.data.i18n[comp.content] = insertLanguage(comp.content);
      }
    });
  });

  return baseTrans;
};

export { alertForm, alertTranslations };
