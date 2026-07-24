import { attachmentUtils } from '@navikt/skjemadigitalisering-shared-domain';
import Attachment from '../../../components/attachment/Attachment';
import { useAppConfig } from '../../../context/app-config/AppConfigContext';
import { useFormDefinition } from '../../../context/form-definition/FormDefinitionContext';
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
  const { form } = useFormDefinition();
  const { translate } = useLanguage();

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
