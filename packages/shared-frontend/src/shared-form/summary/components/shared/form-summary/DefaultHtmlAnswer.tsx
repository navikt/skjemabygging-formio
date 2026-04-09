import { FormSummary } from '@navikt/ds-react';
import { FormComponentProps } from '../../../types';

const DefaultHtmlAnswer = (props: FormComponentProps) => {
  const { component, translate } = props;
  const { textDisplay, content } = component;

  if (!content || textDisplay === undefined || textDisplay === 'form') {
    return null;
  }

  return (
    <FormSummary.Answer>
      <FormSummary.Answer>
        <div dangerouslySetInnerHTML={{ __html: translate(content) }} />
      </FormSummary.Answer>
    </FormSummary.Answer>
  );
};

export default DefaultHtmlAnswer;
