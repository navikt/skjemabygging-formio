import { attachmentUtils } from '@navikt/skjemadigitalisering-shared-domain';
import AttachmentUpload from '../../../components/attachment-upload/AttachmentUpload';
import OtherAttachmentUpload from '../../../components/attachment-upload/OtherAttachmentUpload';
import Attachment from '../../../components/attachment/Attachment';
import { useAppConfig } from '../../../context/app-config/AppConfigContext';
import { useFormDefinition } from '../../../context/form-definition/FormDefinitionContext';
import { useFyllutAppConfig } from '../../../context/fyllut/FyllutAppConfigContext';
import { useLanguage } from '../../../context/language/LanguageContext';
import {
  InputComponentProps,
  isRequired,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputAttachment = ({ component, submissionPath }: InputComponentProps) => {
  const { submissionMethod } = useAppConfig();
  const { logEvent } = useFyllutAppConfig();
  const { form } = useFormDefinition();
  const { translate } = useLanguage();
  const isUploadEnabled = submissionMethod === 'digital' || submissionMethod === 'digitalnologin';

  if (isUploadEnabled) {
    const uploadProps = {
      label: translate(component.label),
      required: isRequired(component),
      description: component.description ? translate(component.description) : undefined,
      attachmentValues: component.attachmentValues ?? component.values,
      attachmentNavId: component.navId ?? component.key,
      onUpload: (attachment) => {
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

    return component.attachmentType === 'other' ? (
      <OtherAttachmentUpload {...uploadProps} />
    ) : (
      <AttachmentUpload {...uploadProps} type={component.attachmentType} />
    );
  }

  return (
    <FormGroup>
      <Attachment
        statePath={resolveSubmissionPath(component, submissionPath)}
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
        readOnly={component.readOnly}
        readMore={resolveReadMore(component)}
      />
    </FormGroup>
  );
};

export default InputAttachment;
