import { attachmentUtils, navFormUtils, SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';
import Attachment from '../../../components/attachment/Attachment';
import { useFormDefinition } from '../../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../../context/language/LanguageContext';
import { useSubmissionMethod } from '../../../context/submission-method/SubmissionMethodContext';
import AttachmentUpload from '../../../fyllut/attachments/components/AttachmentUpload';
import OtherAttachmentUpload from '../../../fyllut/attachments/components/OtherAttachmentUpload';
import { useFyllut } from '../../../fyllut/context/fyllut/FyllutContext';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputAttachment = ({ component, submissionPath }: InputComponentProps) => {
  const { submissionMethod } = useSubmissionMethod();
  const { logEvent } = useFyllut();
  const { form } = useFormDefinition();
  const { translate } = useLanguage();
  const resolvedSubmissionPath = resolveSubmissionPath(component, submissionPath);

  if (attachmentUtils.enableAttachmentUpload(submissionMethod)) {
    const uploadProps = {
      label: translate(component.label),
      required: isRequired(component),
      description: component.description ? translate(component.description) : undefined,
      attachmentValues: component.attachmentValues ?? component.values,
      attachmentNavId: navFormUtils.getNavId(component) ?? component.key,
      submissionPath: resolvedSubmissionPath,
      onUpload: (attachment: SubmissionAttachment) => {
        void logEvent?.({
          name: 'last opp',
          data: {
            type: 'vedlegg',
            skjemaId: form.properties.skjemanummer,
            tema: form.properties.tema,
            tittel: translate(component.label),
            attachmentId: attachment.attachmentId,
            submissionMethod,
          },
        });
      },
    };

    return component.attachmentType === 'other' || component.otherDocumentation ? (
      <OtherAttachmentUpload {...uploadProps} />
    ) : (
      <AttachmentUpload {...uploadProps} type={component.attachmentType} />
    );
  }

  return (
    <FormGroup>
      <Attachment
        statePath={resolvedSubmissionPath}
        label={component.label}
        description={component.description}
        values={attachmentUtils.mapKeysToOptions(
          component.attachmentValues ?? component.values,
          translate,
          submissionMethod,
        )}
        attachmentValues={component.attachmentValues}
        deadlineDays={form.properties?.ettersendelsesfrist}
        required={isRequired(component)}
        fieldSize={resolveFieldSize(component)}
        readOnly={component.readOnly}
        readMore={resolveReadMore(component)}
      />
    </FormGroup>
  );
};

export default InputAttachment;
