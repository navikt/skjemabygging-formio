import { FormSummary } from '@navikt/ds-react';
import { InnerHtml } from '../../../../index';
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
        <InnerHtml content={translate(content)} />
      </FormSummary.Answer>
    </FormSummary.Answer>
  );
};

export default DefaultHtmlAnswer;
