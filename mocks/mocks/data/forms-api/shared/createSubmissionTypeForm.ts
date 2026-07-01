import { attachment, panel, textField } from '../../../form-builder/components';
import identity from '../../../form-builder/components/cutomized/identity';
import yourInformation from '../../../form-builder/components/cutomized/yourInformation';
import form from '../../../form-builder/form/form';
import { formIntroPageWithoutSelfDeclaration } from '../../../form-builder/form/formIntroPage';
import formProperties from '../../../form-builder/form/formProperties';
import { getMockTranslationsFromForm } from '../../../form-builder/shared/utils';

type SubmissionType = 'PAPER' | 'DIGITAL' | 'DIGITAL_NO_LOGIN' | 'STATIC_PDF' | 'PAPER_NO_COVER_PAGE';
type SignatureMode = 'default-empty' | 'omit' | 'none';

interface CreateSubmissionTypeFormOptions {
  formNumber: string;
  path: string;
  title: string;
  submissionTypes: SubmissionType[];
  includeAttachmentPanel?: boolean;
  includeAttachmentLink?: boolean;
  includeSelfDeclaration?: boolean;
  innsendingForklaring?: string;
  ettersendelsesfrist?: number;
  signatureMode?: SignatureMode;
}

type CreateSubmissionTypePropertiesOptions = Pick<
  CreateSubmissionTypeFormOptions,
  'ettersendelsesfrist' | 'formNumber' | 'innsendingForklaring' | 'signatureMode' | 'submissionTypes'
>;

const createProperties = ({
  ettersendelsesfrist,
  formNumber,
  innsendingForklaring,
  signatureMode = 'none',
  submissionTypes,
}: CreateSubmissionTypePropertiesOptions) => {
  const properties = formProperties({
    formNumber,
    submissionTypes,
    ...(signatureMode === 'default-empty' ? { signatures: { values: [{ label: '' }] } } : undefined),
  });

  if (signatureMode === 'omit') {
    const { signatures: _signatures, ...propertiesWithoutSignatures } = properties;
    return {
      ...propertiesWithoutSignatures,
      ...(innsendingForklaring ? { innsendingForklaring } : undefined),
      ...(ettersendelsesfrist ? { ettersendelsesfrist } : undefined),
    };
  }

  return {
    ...properties,
    ...(innsendingForklaring ? { innsendingForklaring } : undefined),
    ...(ettersendelsesfrist ? { ettersendelsesfrist } : undefined),
  };
};

const createAttachmentPanel = (includeAttachmentLink: boolean) =>
  panel({
    title: 'Vedlegg',
    isAttachmentPanel: true,
    components: [
      ...(includeAttachmentLink
        ? [
            attachment({
              label: 'Nav skjema test',
              key: 'navSkjemaTest',
              validate: { required: true },
              properties: {
                vedleggskode: 'K1',
                vedleggskjema: 'nav100754',
                vedleggstittel: 'Kursbevis',
              },
              attachmentValues: {
                leggerVedNaa: { enabled: true, additionalDocumentation: {} },
                ettersender: { enabled: true, showDeadline: true, additionalDocumentation: { enabled: false } },
              },
            }),
          ]
        : []),
      attachment({
        attachmentType: 'other',
        key: 'annenDokumentasjon',
        validate: { required: true },
        attachmentValues: {
          leggerVedNaa: { enabled: true, additionalDocumentation: {} },
          ettersender: { enabled: true, showDeadline: true, additionalDocumentation: { enabled: false } },
          nei: { enabled: true },
        },
      }),
    ],
  });

const shouldAddDigitalIdentityPrefill = (submissionTypes: SubmissionType[]) =>
  submissionTypes.length === 1 && submissionTypes[0] === 'DIGITAL';

const createSubmissionTypeForm = ({
  formNumber,
  includeAttachmentLink = false,
  includeAttachmentPanel = true,
  includeSelfDeclaration = true,
  path,
  submissionTypes,
  title,
  ...propertiesOptions
}: CreateSubmissionTypeFormOptions) =>
  form({
    title,
    formNumber,
    path,
    components: [
      panel({
        title: 'Dine opplysninger',
        components: [
          ...(shouldAddDigitalIdentityPrefill(submissionTypes)
            ? [
                yourInformation({
                  key: 'dineOpplysninger',
                  hidden: true,
                  clearOnHide: false,
                  components: [
                    identity({
                      prefill: true,
                      hidden: true,
                      clearOnHide: false,
                      validate: { required: false },
                    }),
                  ],
                }),
              ]
            : []),
          textField({ label: 'Tekstfelt', validate: { required: true } }),
        ],
      }),
      ...(includeAttachmentPanel ? [createAttachmentPanel(includeAttachmentLink)] : []),
    ],
    properties: createProperties({ formNumber, submissionTypes, ...propertiesOptions }),
    ...(includeSelfDeclaration ? {} : { introPage: formIntroPageWithoutSelfDeclaration() }),
  });

const createSubmissionTypeTranslations = (options: CreateSubmissionTypeFormOptions) =>
  getMockTranslationsFromForm(createSubmissionTypeForm(options));

export { createSubmissionTypeForm, createSubmissionTypeTranslations };
