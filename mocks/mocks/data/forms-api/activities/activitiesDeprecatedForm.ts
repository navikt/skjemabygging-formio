import {
  activites,
  alert,
  attachment,
  container,
  identity,
  maalgruppe,
  panel,
  yourInformation,
} from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const activitiesDeprecatedForm = () =>
  form({
    title: 'Testing activities',
    formNumber: 'testingactivities',
    path: 'testingactivities',
    components: [
      panel({
        key: 'aktiviteter',
        title: 'Aktiviteter',
        components: [
          yourInformation({
            key: 'dineOpplysninger',
            hidden: true,
            clearOnHide: false,
            components: [
              identity({
                key: 'identitet',
                label: 'Identitet',
                prefill: true,
                hidden: true,
                clearOnHide: false,
                validate: { required: false },
              }),
            ],
          }),
          container({
            key: 'container',
            hideLabel: true,
            label: 'Container',
            components: [
              activites({
                key: 'aktivitet',
                label: 'Hvilken aktivitet søker du om støtte i forbindelse med?',
              }),
              maalgruppe({
                key: 'maalgruppe',
                label: 'Målgruppe',
              }),
            ],
          }),
          alert({
            alerttype: 'warning',
            content: '<p>Målgruppe ble ikke preutfylt</p>',
            customConditional: 'show = !data.container.maalgruppe.prefilled',
            key: 'alertstripe',
            textDisplay: 'form',
          }),
        ],
      }),
      panel({
        isAttachmentPanel: true,
        key: 'vedlegg',
        title: 'Vedlegg',
        components: [
          attachment({
            attachmentType: 'other',
            attachmentValues: {
              nei: {
                enabled: true,
              },
              leggerVedNaa: {
                enabled: true,
              },
              ettersender: {
                enabled: true,
                showDeadline: false,
                additionalDocumentation: {
                  enabled: false,
                },
              },
            },
            description: 'Har du noen annen dokumentasjon du ønsker å legge ved?',
            key: 'annenDokumentasjon',
            label: 'Annen dokumentasjon',
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: 'testingactivities', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const activitiesDeprecatedTranslations = () => getMockTranslationsFromForm(activitiesDeprecatedForm());

export { activitiesDeprecatedForm, activitiesDeprecatedTranslations };
