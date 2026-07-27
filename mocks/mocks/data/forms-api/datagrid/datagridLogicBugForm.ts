import { currency, dataGrid, panel, selectBoxes } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const datagridLogicBugForm = () =>
  form({
    title: 'Datagrid logic bug',
    formNumber: 'Datagrid logic bug',
    path: 'datagridlogicbug',
    components: [
      panel({
        key: 'reisemateOgUtgifter',
        title: 'Reisemåte og utgifter',
        components: [
          dataGrid({
            addAnother: 'Legg til transportmiddel',
            key: 'transportmiddelTur',
            label: 'Transportmiddel tur',
            components: [
              selectBoxes({
                description: 'Oppgi alle transportmiddel du brukte for å komme til reisemålet.',
                key: 'transportmiddel',
                label: 'Transportmiddel',
                values: [{ label: 'Buss / trikk / t-bane', value: 'bussTrikkTBane' }],
              }),
              currency({
                conditional: {
                  show: true,
                  when: 'transportmiddelTur.transportmiddel',
                  eq: 'bussTrikkTBane',
                },
                key: 'belopForBussTrikkTBane',
                label: 'Beløp for buss / trikk / t-bane',
              }),
            ],
          }),
        ],
      }),
    ],
    properties: formProperties({
      formNumber: 'Datagrid logic bug',
      submissionTypes: ['PAPER', 'DIGITAL'],
    }),
  });

const datagridLogicBugTranslations = () => getMockTranslationsFromForm(datagridLogicBugForm());

export { datagridLogicBugForm, datagridLogicBugTranslations };
