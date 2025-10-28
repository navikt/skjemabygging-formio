import { FormSummary } from '@navikt/ds-react';
import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { InnerHtml, useLanguages } from '../../../../index';

interface Props {
  component: Component;
}

const DefaultHtmlAnswer = ({ component }: Props) => {
  const { translate } = useLanguages();
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
