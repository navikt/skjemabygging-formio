import { Box } from '@navikt/ds-react';
import ReadMore from '../../../components/read-more/ReadMore';
import { useLanguage } from '../../../context/language/LanguageContext';
import { sanitizeHtml } from '../../../utils/sanitizeHtml';
import { HtmlElementDefinition } from '../../component-types';
import FormGroup from '../../shared/FormGroup';

interface InputHtmlElementProps {
  component: HtmlElementDefinition;
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
