import { activites, alert, container, identity, maalgruppe, panel, radio } from '../../../form-builder/components';
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
          container({
            key: 'dineOpplysninger',
            label: 'Dine opplysninger',
            components: [
              identity({
                key: 'identitet',
                label: 'Identitet',
                prefill: true,
              }),
            ],
          }),
          container({
            hideLabel: true,
            key: 'container',
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
          radio({
            description: 'Har du noen annen dokumentasjon du ønsker å legge ved?',
            key: 'annenDokumentasjon',
            label: 'Annen dokumentasjon',
            values: [
              { label: 'Nei, jeg har ingen ekstra dokumentasjon jeg vil legge ved.', value: 'nei' },
              { label: 'Ja, jeg legger det ved denne søknaden.', value: 'leggerVedNaa' },
              { label: 'Jeg ettersender dokumentasjonen senere.', value: 'ettersender' },
            ],
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: 'testingactivities', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const activitiesDeprecatedTranslations = () => getMockTranslationsFromForm(activitiesDeprecatedForm());

export { activitiesDeprecatedForm, activitiesDeprecatedTranslations };
