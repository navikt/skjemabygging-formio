import { Box } from '@navikt/ds-react';
import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import ReadMore from '../../../components/read-more/ReadMore';
import { useLanguage } from '../../../context/language/LanguageContext';
import { sanitizeHtml } from '../../../utils/sanitizeHtml';
import FormGroup from '../../shared/FormGroup';

interface InputHtmlElementProps {
  component: Component;
}

const InputHtmlElement = ({ component }: InputHtmlElementProps) => {
  const { translate } = useLanguage();

  if (!component.content) {
    return null;
  }

  return (
    <FormGroup>
      <Box marginBlock="space-0 space-32">
        <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(translate(component.content)) }} />
        {component.additionalDescriptionLabel && component.additionalDescriptionText && (
          <ReadMore label={component.additionalDescriptionLabel} text={component.additionalDescriptionText} />
        )}
      </Box>
    </FormGroup>
  );
};

export default InputHtmlElement;
