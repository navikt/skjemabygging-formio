import { attachmentUtils, getNavId } from '@navikt/skjemadigitalisering-shared-domain';
import { useEffect } from 'react';
import Attachment from '../../../components/attachment/Attachment';
import {
  useFormDefinitionForm,
  useFormDefinitionSubmissionMethod,
} from '../../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../../context/language/LanguageContext';
import { isSameSubmissionValue } from '../../../context/state/stateHelpers';
import { useFieldBinding } from '../../../context/state/useFieldBinding';
import { AttachmentDefinition } from '../../component-types';
import { useResolvedValidation } from '../../custom-validation/useResolvedValidation';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentUtils';
import { getAttachmentOptions } from './attachmentOptions';
import { normalizeAttachmentValue } from './attachmentValue';

const InputAttachment = ({ component, submissionPath }: InputComponentProps<AttachmentDefinition>) => {
  const submissionMethod = useFormDefinitionSubmissionMethod();
  const form = useFormDefinitionForm();
  const { translate } = useLanguage();
  const validation = useResolvedValidation(component);
  const resolvedSubmissionPath = resolveSubmissionPath(component, submissionPath);
  const { stateValue, setStateValue } = useFieldBinding({ statePath: resolvedSubmissionPath });
  const normalized = normalizeAttachmentValue(component, resolvedSubmissionPath, stateValue);
  const needsNormalization = !isSameSubmissionValue(stateValue, normalized);
  useEffect(() => {
    if (needsNormalization) setStateValue(normalized);
  }, [needsNormalization, normalized, setStateValue]);

  if (needsNormalization) return null;

  return (
    <Attachment
      statePath={resolvedSubmissionPath}
      label={component.label}
      description={component.description}
      values={getAttachmentOptions(component, submissionMethod, translate)}
      attachmentNavId={getNavId(component) ?? component.key}
      type={component.attachmentType === 'other' || component.otherDocumentation ? 'other' : component.attachmentType}
      uploadEnabled={attachmentUtils.enableAttachmentUpload(submissionMethod)}
      downloadEnabled={attachmentUtils.enableAttachmentDownload(submissionMethod)}
      deadlineDays={form.properties?.ettersendelsesfrist}
      required={isRequired(component)}
      fieldSize={resolveFieldSize(component)}
      readOnly={component.readOnly}
      readMore={resolveReadMore(component)}
      validation={validation}
    />
  );
};

export default InputAttachment;
