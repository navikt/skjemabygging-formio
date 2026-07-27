import { attachment, htmlElement, panel, radio, yourInformation } from '../../../form-builder/components';
import form from '../../../form-builder/form/form';
import formProperties from '../../../form-builder/form/formProperties';

interface CreateLegacyNoLoginFormOptions {
  path: string;
  title: string;
}

const createLegacyNoLoginForm = ({ path, title }: CreateLegacyNoLoginFormOptions) =>
  form({
    title,
    formNumber: 'TST 19-81.07',
    path,
    components: [
      panel({
        title: 'Veiledning',
        key: 'veiledning',
        components: [htmlElement({ key: 'veiledningstekst', content: 'Her kan du søke om støtte til utgiftene.' })],
      }),
      panel({
        title: 'Dine opplysninger',
        key: 'personopplysninger',
        components: [yourInformation()],
      }),
      panel({
        title: 'Utdanning',
        key: 'utdanning',
        components: [
          radio({
            key: 'hoyesteFullforteUtdanning',
            label: 'Høyeste fullførte utdanning',
            validate: { required: true },
            values: [
              { label: 'Grunnskole', value: 'grunnskole' },
              { label: 'Videregående', value: 'videregaende' },
              { label: 'Universitet eller høgskole', value: 'universitetEllerHogskole' },
              { label: 'Annet', value: 'annet' },
            ],
          }),
        ],
      }),
      panel({
        title: 'Vedlegg',
        key: 'vedlegg',
        isAttachmentPanel: true,
        components: [
          attachment({
            id: 'eyobqqf',
            navId: 'eyobqqf',
            key: 'vedleggMedMasseGreier',
            label: 'Vedlegg med masse greier',
            description: 'Beskrivelse til vedlegget',
            additionalDescriptionLabel: 'Her finner du en utvidet beskrivelse',
            additionalDescriptionText: '<p>En utvidet beskrivelse til vedlegget</p>',
            validate: { required: true },
            properties: {
              vedleggskode: 'V2',
              vedleggstittel: 'Vanlig vedlegg',
            },
            attachmentValues: {
              nav: {
                enabled: true,
                additionalDocumentation: {
                  enabled: true,
                  label: 'Tilleggsinfo 6',
                  description: 'Beskrivelse 6',
                },
              },
              andre: {
                enabled: true,
                showDeadline: true,
                additionalDocumentation: {
                  enabled: true,
                  label: 'Tilleggsinfo 5',
                  description: 'Beskrivelse 5',
                },
              },
              harIkke: {
                enabled: true,
                additionalDocumentation: {
                  enabled: true,
                  label: 'Tilleggsinfo 4',
                  description: 'Beskrivelse 4',
                },
              },
              ettersender: {
                enabled: true,
                showDeadline: true,
                additionalDocumentation: {
                  enabled: true,
                  label: 'Tilleggsinfo 2',
                  description: 'Beskrivelse 2',
                },
              },
              leggerVedNaa: {
                enabled: true,
                additionalDocumentation: {
                  enabled: true,
                  label: 'Tilleggsinfo',
                  description: 'Beskrivelse',
                },
              },
              levertTidligere: {
                enabled: true,
                additionalDocumentation: {
                  enabled: true,
                  label: 'Tilleggsinfo 3',
                  description: 'Beskrivelse 3',
                },
              },
            },
          }),
          attachment({
            id: 'ebb1qzd',
            navId: 'e3xh1d',
            key: 'bekreftelsePaUtdanning',
            label: 'Bekreftelse på utdanning',
            validate: { required: true },
            conditional: {
              show: true,
              when: 'hoyesteFullforteUtdanning',
              eq: 'annet',
            },
            properties: {
              vedleggskode: 'U1',
              vedleggstittel: 'Bekreftelse på utdanning',
            },
            attachmentValues: {
              leggerVedNaa: { enabled: true, additionalDocumentation: { enabled: false } },
              ettersender: { enabled: true, showDeadline: false, additionalDocumentation: { enabled: false } },
              levertTidligere: { enabled: true, additionalDocumentation: { enabled: false } },
              nav: { enabled: false, additionalDocumentation: {} },
              andre: { enabled: false, additionalDocumentation: {} },
              harIkke: { enabled: false, additionalDocumentation: {} },
            },
          }),
          attachment({
            id: 'evfo5qs',
            navId: 'en5h1c',
            key: 'annenDokumentasjon',
            attachmentType: 'other',
            label: 'Annen dokumentasjon',
            description: 'Har du noen annen dokumentasjon du ønsker å legge ved?',
            validate: { required: true },
          }),
        ],
      }),
    ],
    properties: {
      ...formProperties({
        formNumber: 'TST 19-81.07',
        submissionTypes: ['PAPER', 'DIGITAL', 'DIGITAL_NO_LOGIN'],
        subsequentSubmissionTypes: ['PAPER', 'DIGITAL'],
        mellomlagringDurationDays: '28',
        signatures: { values: [{ label: '' }] },
      }),
      ettersendelsesfrist: '14',
    },
  });

export { createLegacyNoLoginForm };
