import { container, panel, radio, sender } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const senderForm = () => {
  const formNumber = 'sender';

  return form({
    title: 'Sender component test form',
    formNumber,
    path: formNumber,
    components: [
      panel({
        title: 'Velg avsenderpanel',
        components: [
          radio({
            label: 'Velg avsenderpanel',
            key: 'senderPanelSelection',
            defaultValue: 'conditionalSender',
            validate: {
              required: false,
            },
            values: [
              { label: 'Person', value: 'person' },
              { label: 'Organisasjon', value: 'organization' },
              { label: 'Organisasjon nested container', value: 'nestedOrganization' },
              { label: 'Valgstyrt avsender', value: 'conditionalSender' },
            ],
          }),
        ],
      }),
      panel({
        title: 'Person',
        conditional: {
          show: true,
          when: 'senderPanelSelection',
          eq: 'person',
        },
        components: [
          sender({
            label: 'Mottaker (person)',
            key: 'mottakerPerson',
            senderRole: 'person',
          }),
        ],
      }),
      panel({
        title: 'Organisasjon',
        conditional: {
          show: true,
          when: 'senderPanelSelection',
          eq: 'organization',
        },
        components: [
          sender({
            label: 'Mottaker (organisasjon)',
            key: 'mottakerOrganisasjon',
            senderRole: 'organization',
          }),
        ],
      }),
      panel({
        title: 'Organisasjon nested container',
        conditional: {
          show: true,
          when: 'senderPanelSelection',
          eq: 'nestedOrganization',
        },
        components: [
          container({
            key: 'containerOrganization',
            components: [
              container({
                key: 'containerOrganizationNested',
                components: [
                  sender({
                    label: 'Mottaker (organisasjon)',
                    key: 'mottakerOrganisasjonNested',
                    senderRole: 'organization',
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      panel({
        title: 'Valgstyrt avsender',
        customConditional: 'show = !data.senderPanelSelection || data.senderPanelSelection === "conditionalSender"',
        components: [
          radio({
            label: 'Velg avsendertype',
            key: 'senderRoleSelection',
            defaultValue: 'organization',
            validate: {
              required: false,
            },
            values: [
              { label: 'Person', value: 'person' },
              { label: 'Organisasjon', value: 'organization' },
            ],
          }),
          sender({
            label: 'Mottaker (person)',
            key: 'valgstyrtMottakerPerson',
            senderRole: 'person',
            conditional: {
              show: true,
              when: 'senderRoleSelection',
              eq: 'person',
            },
          }),
          sender({
            label: 'Mottaker (organisasjon)',
            key: 'valgstyrtMottakerOrganisasjon',
            senderRole: 'organization',
            conditional: {
              show: true,
              when: 'senderRoleSelection',
              eq: 'organization',
            },
          }),
        ],
      }),
    ],
  });
};

const senderTranslations = () => getMockTranslationsFromForm(senderForm());

export { senderForm, senderTranslations };
