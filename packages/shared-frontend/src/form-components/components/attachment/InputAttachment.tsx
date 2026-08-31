import { attachmentUtils } from '@navikt/skjemadigitalisering-shared-domain';
import Attachment from '../../../components/attachment/Attachment';
import { useFormDefinition } from '../../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../../context/language/LanguageContext';
import { useSubmissionMethod } from '../../../context/submission-method/SubmissionMethodContext';
import { AttachmentDefinition } from '../../component-types';
import {
  InputComponentProps,
  isRequired,
  resolveFieldSize,
  resolveReadMore,
  resolveSubmissionPath,
} from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const InputAttachment = ({ component, submissionPath }: InputComponentProps<AttachmentDefinition>) => {
  const { submissionMethod } = useSubmissionMethod();
  const { form } = useFormDefinition();
  const { translate } = useLanguage();
  const resolvedSubmissionPath = resolveSubmissionPath(component, submissionPath);

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
