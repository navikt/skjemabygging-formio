import { alert, formGroup, panel } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const alertDeprecatedForm = () =>
  form({
    title: 'Testing alert',
    formNumber: 'testingalert',
    path: 'testingalert',
    components: [
      panel({
        key: 'page1',
        title: 'Page 1',
        components: [
          formGroup({
            key: 'new1',
            label: 'New',
            legend: 'Skjemagruppe',
            components: [
              alert({
                content: 'New alert 1',
                key: 'alertstripe',
              }),
              alert({
                alerttype: 'success',
                content: 'New alert 2',
                key: 'alertstripe1',
              }),
            ],
          }),
          formGroup({
            key: 'navSkjemagruppe',
            label: 'Skjemagruppe',
            legend: 'Gruppering av eldre alerts',
            components: [
              alert({
                content: 'Old alert 1',
                key: 'alertstripe2',
              }),
              alert({
                alerttype: 'success',
                content: 'Old alert 2',
                key: 'alertstripe3',
              }),
            ],
          }),
          alert({
            content: `<h1>Tittel</h1>
<a href="https://www.nav.no/">Link</a>`,
            key: 'alertstripehtml',
          }),
          alert({
            alerttype: 'success',
            content: '<p>Norwegian alertType</p>',
            key: 'alertstripenorwegian',
            textDisplay: 'form',
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: 'testingalert', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const alertDeprecatedTranslations = () => getMockTranslationsFromForm(alertDeprecatedForm());

export { alertDeprecatedForm, alertDeprecatedTranslations };
