import { Box, Label } from '@navikt/ds-react';
import TranslatedDescription from '../../../components/shared/TranslatedDescription';
import { useLanguage } from '../../../context/language/LanguageContext';
import { ContainerDefinition } from '../../component-types';
import { InputComponentRegistry } from '../../inputComponentRegistry';
import RenderInputForm from '../../RenderInputForm';
import FormGroup from '../../shared/FormGroup';

interface InputContainerProps {
  component: ContainerDefinition;
  componentRegistry?: InputComponentRegistry;
}

const InputContainer = ({ component, componentRegistry }: InputContainerProps) => {
  const { translate } = useLanguage();

  if (!component.components?.length) {
    return null;
  }

  const { label, hideLabel, description, components } = component;

  return (
    <FormGroup>
      <Box marginBlock="space-0 space-40" data-cy="input-container">
        {!hideLabel && label && <Label as="div">{translate(label)}</Label>}
        {description && <TranslatedDescription>{description}</TranslatedDescription>}
        <RenderInputForm components={components} componentRegistry={componentRegistry} />
      </Box>
    </FormGroup>
  );
};

export default InputContainer;
