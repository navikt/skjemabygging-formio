import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { AttachmentTexts } from '../../../../../components/attachment/Attachment';

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
            customConditional: `show = data?.attachmentValues?.${key}?.additionalDocumentation?.enabled === true`,
            validate: {
              required: true,
            },
          },
          {
            type: 'textfield',
            key: 'description',
            customClass: 'ml',
            label: 'Beskrivelse av krav til tilleggsinformasjon',
            customConditional: `show = data?.attachmentValues?.${key}?.additionalDocumentation?.enabled === true`,
          },
        ],
      });
    }

    return {
      type: 'container',
      key: key,
      label: '',
      components: [
        {
          type: 'checkbox',
          key: 'enabled',
          label,
          customConditional,
        },
        {
          type: 'fieldset',
          key: '',
          label: '',
          customClass: 'ml',
          customConditional: `show = data?.attachmentValues?.${key}?.enabled === true`,
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
            component('leggerVedNaa', AttachmentTexts.leggerVedNaa, true, false),
            component('ettersender', AttachmentTexts.ettersender, true, true),
            component('nei', AttachmentTexts.nei, true, false, 'show = data?.attachmentType === "other"'),
            component(
              'levertTidligere',
              AttachmentTexts.levertTidligere,
              true,
              false,
              'show = data?.attachmentType === "default"',
            ),
            component('harIkke', AttachmentTexts.harIkke, true, false, 'show = data?.attachmentType === "default"'),
            component('andre', AttachmentTexts.andre, true, true, 'show = data?.attachmentType === "default"'),
            component('nav', AttachmentTexts.nav, true, true, 'show = data?.attachmentType === "default"'),
          ],
        },
      ],
    },
  ];
};

export default editFormAttachment;
