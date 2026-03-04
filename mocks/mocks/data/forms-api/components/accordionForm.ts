import { accordion, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const accordionForm = () => {
  const formNumber = 'accordion';

  return form({
    title: 'Accordion component test form',
    formNumber: formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Visning',
        components: [
          accordion({
            label: 'Trekkspill',
            accordionValues: [
              { title: 'Åpen seksjon', content: '<p>Innhold i åpen seksjon</p>', defaultOpen: true } as any,
              { title: 'Lukket seksjon', content: '<p>Innhold i lukket seksjon</p>' },
            ],
          }),
        ],
      }),
    ],
  });
};

const accordionTranslations = () => {
  const formData = accordionForm();
  const baseTrans = getMockTranslationsFromForm(formData);

  // getMockTranslationsFromForm does not handle accordionValues, so add accordion item translations manually
  const insertLanguage = (value: string) => {
    const regex = /(<\/[^>]+>$)/;
    return regex.test(value) ? value.replace(regex, ' (en)$1') : `${value} (en)`;
  };

  formData.components.forEach((panelComp: any) => {
    panelComp.components?.forEach((comp: any) => {
      if (comp.type === 'accordion' && comp.accordionValues) {
        comp.accordionValues.forEach((item: any) => {
          if (item.title) baseTrans.data.i18n[item.title] = insertLanguage(item.title);
          if (item.content) baseTrans.data.i18n[item.content] = insertLanguage(item.content);
        });
      }
    });
  });

  return baseTrans;
};

export { accordionForm, accordionTranslations };
