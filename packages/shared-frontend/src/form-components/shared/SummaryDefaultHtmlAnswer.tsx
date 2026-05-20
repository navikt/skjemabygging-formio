import { FormSummary } from '@navikt/ds-react';
import DOMPurify from 'dompurify';
import { FormComponentProps } from '../types';

const sanitizeOptions = { ADD_ATTR: ['target'] };

// Mirrors htmlUtils.sanitizeHtmlString in shared-components: two passes of DOMPurify
// with `target` allowed. Inlined here so shared-frontend does not depend on
// shared-components.
const sanitize = (content: string) => DOMPurify.sanitize(DOMPurify.sanitize(content, sanitizeOptions), sanitizeOptions);

const DefaultHtmlAnswer = (props: FormComponentProps) => {
  const { component, translate } = props;
  const { textDisplay, content } = component;

  if (!content || textDisplay === undefined || textDisplay === 'form') {
    return null;
  }

  return (
    <FormSummary.Answer>
      <FormSummary.Answer>
        <div dangerouslySetInnerHTML={{ __html: sanitize(translate(content)) }} />
      </FormSummary.Answer>
    </FormSummary.Answer>
  );
};

export default DefaultHtmlAnswer;
