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

const alertTranslations = () => getMockTranslationsFromForm(alertForm());

export { alertForm, alertTranslations };
