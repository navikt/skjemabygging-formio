import { attachment, container, formGroup, panel, textField } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

const containerSkjemagruppeSkjemagruppeForm = () =>
  form({
    title: 'Test skjemagruppe og container',
    formNumber: 'test-skjemagruppe',
    path: 'testskjemagruppe',
    components: [
      panel({
        key: 'skjemagrupper',
        title: 'Skjemagrupper',
        components: [
          formGroup({
            key: 'navSkjemagruppe',
            label: 'Skjemagruppe',
            legend: 'Skjemagruppe',
            components: [
              textField({
                key: 'tekstfeltInniSkjemagruppe',
                label: 'Tekstfelt inni skjemagruppe',
              }),
              formGroup({
                key: 'navSkjemagruppe1',
                label: 'Skjemagruppe',
                legend: 'Skjemagruppe inni skjemagruppe',
                components: [
                  textField({
                    key: 'tekstfeltInniSkjemagruppeInniSkjemagruppe',
                    label: 'Tekstfelt inni skjemagruppe inni skjemagruppe',
                  }),
                ],
              }),
            ],
          }),
          container({
            hideLabel: true,
            key: 'beholderMedSkjemagruppe',
            label: 'Beholder med skjemagruppe',
            components: [
              formGroup({
                key: 'navSkjemagruppe',
                label: 'Skjemagruppe',
                legend: 'Skjemagruppe inni container',
                components: [
                  textField({
                    key: 'tekstfeltInniSkjemagruppeInniContainer',
                    label: 'Tekstfelt inni skjemagruppe inni container',
                  }),
                ],
              }),
              formGroup({
                key: 'navSkjemagruppe1',
                label: 'Skjemagruppe',
                legend: 'Skjemagruppe med container',
                components: [
                  container({
                    hideLabel: true,
                    key: 'containerInniSkjemagruppe',
                    label: 'Container inni skjemagruppe',
                    components: [
                      textField({
                        key: 'tekstfeltInniContainerInniSkjemagruppe1',
                        label: 'Tekstfelt inni container inni skjemagruppe',
                      }),
                    ],
                  }),
                ],
              }),
            ],
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
            },
            description: 'Har du noen annen dokumentasjon du ønsker å legge ved?',
            key: 'annenDokumentasjon',
            label: 'Annen dokumentasjon',
          }),
        ],
      }),
    ],
    properties: formProperties({ formNumber: 'test-skjemagruppe', submissionTypes: ['PAPER', 'DIGITAL'] }),
  });

const containerSkjemagruppeSkjemagruppeTranslations = () =>
  getMockTranslationsFromForm(containerSkjemagruppeSkjemagruppeForm());

export { containerSkjemagruppeSkjemagruppeForm, containerSkjemagruppeSkjemagruppeTranslations };
