import apiEditForm from 'formiojs/components/_classes/component/editForm/Component.edit.api';
import conditionalEditForm from 'formiojs/components/_classes/component/editForm/Component.edit.conditional';
import displayEditForm from 'formiojs/components/_classes/component/editForm/Component.edit.display';
import validationEditForm from 'formiojs/components/_classes/component/editForm/Component.edit.validation';
import { getContextComponents } from 'formiojs/utils/utils';

const datepickerForm = () => {
  const excludeFromDisplay = [
    'placeholder',
    'hidden',
    'disabled',
    'tooltip',
    'customClass',
    'labelPosition',
    'tabindex',
    'hideLabel',
    'autofocus',
    'tableView',
    'modalEdit',
    'unique',
  ];

  return {
    type: 'hidden',
    key: 'type',
    components: [
      {
        type: 'tabs',
        key: 'tabs',
        components: [
          {
            label: 'Visning',
            key: 'display',
            weight: 0,
            components: [
              {
                type: 'checkbox',
                label: 'Vis årvelger i kalender',
                key: 'visArvelger',
                defaultValue: true,
                input: true,
              },
              ...displayEditForm.filter((field) => !excludeFromDisplay.includes(field.key)),
            ],
          },
          {
            label: 'Validering',
            key: 'validation',
            weight: 20,
            components: [
              {
                type: 'panel',
                title: 'Fra-til-dato',
                components: [
                  {
                    type: 'select',
                    input: true,
                    label: 'Datofelt for fra-dato',
                    key: 'beforeDateInputKey',
                    dataSrc: 'custom',
                    valueProperty: 'value',
                    data: {
                      custom(context) {
                        return getContextComponents(context);
                      },
                    },
                  },
                  {
                    type: 'checkbox',
                    label: 'Kan være lik',
                    key: 'mayBeEqual',
                    defaultValue: false,
                    input: true,
                  },
                ],
              },
              {
                type: 'panel',
                title: 'Begrens periode relativt til dagens dato',
                components: [
                  {
                    type: 'number',
                    label: 'Tidligst tillatt dato (antall dager fram/bak i tid)',
                    key: 'earliestAllowedDate',
                    input: true,
                  },
                  {
                    type: 'number',
                    label: 'Senest tillatt dato (antall dager fram/bak i tid)',
                    key: 'latestAllowedDate',
                    input: true,
                  },
                  {
                    type: 'alertstripe',
                    key: 'begrensTillattDatoInfo',
                    content:
                      '<div><p>Oppgi antall dager for å sette tidligste og seneste tillatte dato. Begrensningen er relativ til datoen skjemaet fylles ut. Bruk positive tall for å oppgi dager fram i tid, negative tall for å sette tillatt dato bakover i tid, og 0 for å sette dagens dato som tidligst/senest tillatt.</p><p>Eksempel: hvis tidligst tillatt er satt til -5, vil datoer før 10. august 2022 gi feilmelding når skjemaet fylles ut 15. august 2022</p></div>',
                    alerttype: 'info',
                  },
                ],
              },
              {
                type: 'panel',
                title: 'Begrens dato til tidligst/senest en spesifikk dato',
                components: [
                  {
                    type: 'navDatepicker',
                    label: 'Tidligst tillatt dato',
                    key: 'specificEarliestAllowedDate',
                    input: true,
                  },
                  {
                    type: 'navDatepicker',
                    label: 'Senest tillatt dato',
                    key: 'specificLatestAllowedDate',
                    input: true,
                  },
                ],
              },
              ...validationEditForm.filter((field) => !excludeFromDisplay.includes(field.key)),
            ],
          },
          {
            label: 'Conditional',
            key: 'conditional',
            weight: 40,
            components: conditionalEditForm,
          },
          {
            label: 'API',
            key: 'api',
            weight: 60,
            components: apiEditForm,
          },
        ],
      },
    ],
  };
};

export default datepickerForm;
