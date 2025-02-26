import { AttachmentSettingValues, AttachmentType, Component, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';

interface EditFormAttachmentComponent {
  key: keyof AttachmentSettingValues;
  label: string;
  additionalDocumentation: boolean;
  showDeadline: boolean;
  customConditional?: string;
  customConditionalOptions?: string;
  forceEnabled?: boolean;
  readOnly?: boolean;
}

const showForAttachmentType = (attachmentType: AttachmentType) => {
  return `show = data.attachmentType === "${attachmentType}"`;
};

const showForRowEnabled = (enabled: boolean) => {
  return `show = row.enabled === ${enabled}`;
};

const additionalDocumentationComponents = () => {
  return {
    type: 'container',
    key: 'additionalDocumentation',
    label: '',
    components: [
      {
        type: 'navCheckbox',
        key: 'enabled',
        label: 'Bruker må oppgi tilleggsinformasjon',
      },
      {
        type: 'textfield',
        key: 'label',
        customClass: 'ml',
        label: 'Ledetekst for tilleggsinformasjon',
        customConditional: showForRowEnabled(true),
        validate: {
          required: true,
        },
      },
      {
        type: 'textfield',
        key: 'description',
        customClass: 'ml',
        label: 'Beskrivelse av krav til tilleggsinformasjon',
        customConditional: showForRowEnabled(true),
      },
    ],
  };
};

const editFormAttachment = (): Component[] => {
  const component = ({
    key,
    label,
    additionalDocumentation,
    showDeadline,
    customConditional = '',
    customConditionalOptions = '',
    forceEnabled = false,
    readOnly = false,
  }: EditFormAttachmentComponent) => {
    const components: Component[] = [];

    if (showDeadline) {
      components.push({
        type: 'navCheckbox',
        key: 'showDeadline',
        label: 'Informér bruker om ettersendelsesfrist (settes i skjemainnstillinger)',
      });
    }

    if (additionalDocumentation) {
      components.push(additionalDocumentationComponents());
    }

    return {
      type: 'container',
      key: key,
      label: '',
      customConditional,
      components: [
        {
          type: 'navCheckbox',
          key: 'enabled',
          defaultValue: forceEnabled,
          readOnly: readOnly,
          label,
          validate: {
            custom:
              'valid = (' +
              'data.attachmentValues?.leggerVedNaa?.enabled !== true && ' +
              'data.attachmentValues?.ettersender?.enabled !== true && ' +
              'data.attachmentValues?.nei?.enabled !== true && ' +
              'data.attachmentValues?.levertTidligere?.enabled !== true && ' +
              'data.attachmentValues?.harIkke?.enabled !== true && ' +
              'data.attachmentValues?.andre?.enabled !== true && ' +
              'data.attachmentValues?.nav?.enabled !== true' +
              ') ? "Du må minimum velge ett innsendingsalternativ" : true',
          },
        },
        {
          type: 'fieldset',
          key: '',
          label: '',
          customClass: 'ml',
          customConditional: customConditionalOptions ? customConditionalOptions : showForRowEnabled(true),
          components,
        },
      ],
    };
  };

  return [
    {
      type: 'container',
      key: 'attachmentValues',
      label: '',
      hideLabel: true,
      components: [
        {
          type: 'panel',
          key: '',
          label: '',
          title: 'Velg innsendingsalternativer for dette vedlegget',
          customClass: 'group-margin-small',
          components: [
            component({
              key: 'leggerVedNaa',
              label: TEXTS.statiske.attachment.leggerVedNaa,
              additionalDocumentation: true,
              showDeadline: false,
              customConditional: showForAttachmentType('default'),
            }),
            component({
              key: 'leggerVedNaa',
              label: TEXTS.statiske.attachment.leggerVedNaa,
              additionalDocumentation: false,
              showDeadline: false,
              customConditional: showForAttachmentType('other'),
              readOnly: true,
            }),
            component({
              key: 'ettersender',
              label: TEXTS.statiske.attachment.ettersender,
              additionalDocumentation: true,
              showDeadline: true,
              customConditional: showForAttachmentType('default'),
            }),
            component({
              key: 'nei',
              label: TEXTS.statiske.attachment.nei,
              additionalDocumentation: false,
              showDeadline: false,
              customConditional: showForAttachmentType('other'),
              forceEnabled: true,
              readOnly: true,
            }),
            component({
              key: 'levertTidligere',
              label: TEXTS.statiske.attachment.levertTidligere,
              additionalDocumentation: true,
              showDeadline: false,
              customConditional: showForAttachmentType('default'),
            }),
            component({
              key: 'harIkke',
              label: TEXTS.statiske.attachment.harIkke,
              additionalDocumentation: true,
              showDeadline: false,
              customConditional: showForAttachmentType('default'),
            }),
            component({
              key: 'andre',
              label: TEXTS.statiske.attachment.andre,
              additionalDocumentation: true,
              showDeadline: true,
              customConditional: showForAttachmentType('default'),
            }),
            component({
              key: 'nav',
              label: TEXTS.statiske.attachment.nav,
              additionalDocumentation: true,
              showDeadline: false,
              customConditional: showForAttachmentType('default'),
            }),
          ],
        },
      ],
    },
  ];
};

export default editFormAttachment;
