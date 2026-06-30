import { container, htmlElement, panel, radio, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const containerSkjemagruppeContainerForm = () =>
  form({
    title: 'Nested containers',
    formNumber: 'container123',
    path: 'container123',
    components: [
      panel({
        key: 'introduksjon',
        title: 'Introduksjon',
        components: [
          htmlElement({
            content: '<p>Her er litt tekst...</p>',
            key: 'htmlelement',
            textDisplay: 'form',
          }),
        ],
      }),
      panel({
        key: 'visBeholdere',
        title: 'Vis beholdere',
        components: [
          radio({
            key: 'visYtreContainer',
            label: 'Vis ytre container',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          radio({
            key: 'visIndreContainer',
            label: 'Vis indre container',
            values: [
              { label: 'Ja', value: 'ja' },
              { label: 'Nei', value: 'nei' },
            ],
          }),
          container({
            conditional: {
              show: true,
              when: 'visYtreContainer',
              eq: 'ja',
            },
            hideLabel: true,
            key: 'ytreContainer',
            label: 'Ytre container',
            components: [
              textField({
                key: 'ytreTekstfelt',
                label: 'Ytre tekstfelt',
              }),
              container({
                conditional: {
                  show: true,
                  when: 'visIndreContainer',
                  eq: 'ja',
                },
                hideLabel: true,
                key: 'indreContainer',
                label: 'Indre container',
                components: [
                  textField({
                    key: 'indreTekstfelt',
                    label: 'Indre tekstfelt',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: 'container123', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const containerSkjemagruppeContainerTranslations = () =>
  getMockTranslationsFromForm(containerSkjemagruppeContainerForm());

export { containerSkjemagruppeContainerForm, containerSkjemagruppeContainerTranslations };
