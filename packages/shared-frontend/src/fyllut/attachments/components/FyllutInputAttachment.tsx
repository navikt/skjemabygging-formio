import { attachmentUtils, navFormUtils, SubmissionAttachment } from '@navikt/skjemadigitalisering-shared-domain';
import { useFormDefinition } from '../../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../../context/language/LanguageContext';
import { useSubmissionMethod } from '../../../context/submission-method/SubmissionMethodContext';
import InputAttachment from '../../../form-components/components/attachment/InputAttachment';
import {
  InputComponentProps,
  isRequired,
  resolveSubmissionPath,
} from '../../../form-components/inputComponentRegistryUtils';
import { useFyllut } from '../../context/fyllut/FyllutContext';
import AttachmentUpload from './AttachmentUpload';
import OtherAttachmentUpload from './OtherAttachmentUpload';

const FyllutInputAttachment = ({ component, submissionPath }: InputComponentProps) => {
  const { submissionMethod } = useSubmissionMethod();
  const { logEvent } = useFyllut();
  const { form } = useFormDefinition();
  const { translate } = useLanguage();

  if (!attachmentUtils.enableAttachmentUpload(submissionMethod)) {
    return <InputAttachment component={component} submissionPath={submissionPath} />;
  }

  const uploadProps = {
    label: translate(component.label),
    required: isRequired(component),
    description: component.description ? translate(component.description) : undefined,
    attachmentValues: component.attachmentValues ?? component.values,
    attachmentNavId: navFormUtils.getNavId(component) ?? component.key,
    submissionPath: resolveSubmissionPath(component, submissionPath),
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
};

export default FyllutInputAttachment;
