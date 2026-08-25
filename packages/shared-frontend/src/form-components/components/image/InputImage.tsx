import { Box } from '@navikt/ds-react';
import { useLanguage } from '../../../context/language/LanguageContext';
import { sanitizeHtml } from '../../../utils/sanitizeHtml';
import { InputComponentProps } from '../../inputComponentRegistryUtils';
import FormGroup from '../../shared/FormGroup';

const getWidth = (widthPercent?: number) => {
  if (!widthPercent || widthPercent > 100) {
    return '100%';
  }

  return `${widthPercent}%`;
};

const InputImage = ({ component }: InputComponentProps) => {
  const { translate } = useLanguage();
  const imageUrl = component.image?.[0]?.url;

  if (!imageUrl) {
    return null;
  }

  return (
    <FormGroup>
      <Box marginBlock="space-0 space-32">
        <img src={imageUrl} style={{ width: getWidth(component.widthPercent) }} alt={component.altText} />
        {component.description && (
          <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(translate(component.description)) }} />
        )}
      </Box>
    </FormGroup>
  );
};

export default InputImage;
