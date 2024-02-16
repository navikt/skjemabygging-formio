import { Component, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

const editFormAttachment = (): Component[] => {
  const component = (
    key: string,
    label: string,
    additionalDocumentation: boolean,
    showDeadline: boolean,
    customConditional: string = '',
  ) => {
    const components: Component[] = [];

    if (showDeadline) {
      components.push({
        type: 'checkbox',
        key: 'showDeadline',
        label: 'Informér bruker om ettersendelsesfrist (settes i skjemainnstillinger)',
      });
    }

    if (additionalDocumentation) {
      components.push({
        type: 'container',
        key: 'additionalDocumentation',
        label: '',
        components: [
          {
            type: 'checkbox',
            key: 'enabled',
            label: 'Bruker må oppgi tilleggsinformasjon',
          },
          {
            type: 'textfield',
            key: 'label',
            customClass: 'ml',
            label: 'Ledetekst for tilleggsinformasjon',
            customConditional: `show = row.enabled === true`,
            validate: {
              required: true,
            },
          },
          {
            type: 'textfield',
            key: 'description',
            customClass: 'ml',
            label: 'Beskrivelse av krav til tilleggsinformasjon',
            customConditional: `show = row.enabled === true`,
          },
        ],
      });
    }

    return {
      type: 'container',
      key: key,
      label: '',
      customConditional,
      components: [
        {
          type: 'checkbox',
          key: 'enabled',
          label,
        },
        {
          type: 'fieldset',
          key: '',
          label: '',
          customClass: 'ml',
          customConditional: `show = row.enabled === true`,
          components,
        },
      ],
    };
  };

  return [
    {
      label: 'Velg vedlegsstype',
      type: 'radiopanel',
      key: 'attachmentType',
      input: true,
      values: [
        {
          label: 'Standard vedlegg',
          value: 'default',
        },
        {
          label: 'Annen dokumentasjon',
          value: 'other',
        },
      ],
      validate: {
        required: true,
      },
    },
    {
      type: 'container',
      key: 'attachmentValues',
      label: '',
      hideLabel: true,
      customConditional: 'show = data?.attachmentType',
      components: [
        {
          type: 'panel',
          key: '',
          label: '',
          title: 'Velg innsendingsalternativer for dette vedlegget',
          customClass: 'group-margin-small',
          components: [
            component('leggerVedNaa', TEXTS.statiske.attachment.leggerVedNaa, true, false),
            component('ettersender', TEXTS.statiske.attachment.ettersender, true, true),
            component('nei', TEXTS.statiske.attachment.nei, true, false, 'show = data?.attachmentType === "other"'),
            component(
              'levertTidligere',
              TEXTS.statiske.attachment.levertTidligere,
              true,
              false,
              'show = data?.attachmentType === "default"',
            ),
            component(
              'harIkke',
              TEXTS.statiske.attachment.harIkke,
              true,
              false,
              'show = data?.attachmentType === "default"',
            ),
            component(
              'andre',
              TEXTS.statiske.attachment.andre,
              true,
              true,
              'show = data?.attachmentType === "default"',
            ),
            component('nav', TEXTS.statiske.attachment.nav, true, true, 'show = data?.attachmentType === "default"'),
          ],
        },
      ],
    },
  ];
};

export default editFormAttachment;
