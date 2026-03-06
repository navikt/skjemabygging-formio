import { htmlElement, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const htmlElementForm = () => {
  const formNumber = 'htmlelement';

  return form({
    title: 'HtmlElement component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          htmlElement({
            content: '<p>Innhold i skjema</p>',
            textDisplay: 'form',
          }),
          htmlElement({
            content: '<p>Innhold i skjema og PDF</p>',
            textDisplay: 'formPdf',
          }),
          // textDisplay: 'pdf' requires hidden: true (set by form builder calculateValue)
          {
            ...htmlElement({
              content: '<p>Innhold kun i PDF</p>',
              textDisplay: 'pdf',
            }),
            hidden: true,
          },
          htmlElement({
            content: '<p>Innhold med tilleggsbeskrivelse</p>',
            additionalDescriptionLabel: 'Vis mer',
            additionalDescriptionText: '<p>Tilleggsbeskrivelse</p>',
          }),
        ],
      }),
    ],
  });
};

const htmlElementTranslations = () => getMockTranslationsFromForm(htmlElementForm());

export { htmlElementForm, htmlElementTranslations };
