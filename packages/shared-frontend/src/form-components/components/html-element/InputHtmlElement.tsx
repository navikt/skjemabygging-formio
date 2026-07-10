import { Box } from '@navikt/ds-react';
import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../../context/language/LanguageContext';
import { sanitizeHtml } from '../../../utils/sanitizeHtml';

interface InputHtmlElementProps {
  component: Component;
}

const InputHtmlElement = ({ component }: InputHtmlElementProps) => {
  const { translate } = useLanguage();

  if (!component.content) {
    return null;
  }

  return (
    <Box marginBlock="space-0 space-32">
      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(translate(component.content)) }} />
    </Box>
  );
};

export default InputHtmlElement;
