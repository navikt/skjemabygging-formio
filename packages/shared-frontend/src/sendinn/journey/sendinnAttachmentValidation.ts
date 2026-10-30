import { attachmentUtils, Form, Submission, TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { getActivePanels, toComponentDefinitions } from '../../context/form-definition/formDefinitionUtils';
import { collectPageValidationFields } from '../../form-components/page-validation/collectPageValidationFields';

const collectSendinnAttachmentValidationFields = ({
  form,
  submission,
  currentLanguage,
}: {
  form: Form;
  submission?: Submission;
  currentLanguage: string;
}) => {
  const panel = getActivePanels(form, submission, { submissionMethod: 'paper' }).find(
    ({ key }) => key === 'sendinnAttachments',
  );
  const components = panel?.components ?? [];
  const fields = collectPageValidationFields({
    components: toComponentDefinitions(components),
    form,
    submission,
    submissionMethod: 'paper',
    currentLanguage,
  });
  const hasSelection = attachmentUtils
    .collectAttachmentsFromData(components, submission ?? { data: {} })
    .some(({ value }) => value === 'leggerVedNaa');
  // The first available choice anchors the error, but any available choice satisfies it.
  const anchor = fields.find(({ statePath }) => statePath.endsWith('.value'));
  return fields.map((field) =>
    field === anchor
      ? {
          ...field,
          value: hasSelection,
          rules: {
            ...field.rules,
            notEqual: {
              value: false,
              comparison: 'strict' as const,
              message: TEXTS.statiske.sendinn.selectAttachment,
            },
          },
        }
      : field,
  );
};

export { collectSendinnAttachmentValidationFields };
