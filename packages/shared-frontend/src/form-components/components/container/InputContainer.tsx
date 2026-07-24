import { Box } from '@navikt/ds-react';
import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { InputComponentRegistry } from '../../inputComponentRegistry';
import RenderInputForm from '../../RenderInputForm';
import FormGroup from '../../shared/FormGroup';

interface InputContainerProps {
  component: Component;
  componentRegistry?: InputComponentRegistry;
}

const InputContainer = ({ component, componentRegistry }: InputContainerProps) => {
  if (!component.components?.length) {
    return null;
  }

  return (
    <FormGroup>
      <Box data-cy="input-container">
        <RenderInputForm components={component.components} componentRegistry={componentRegistry} />
      </Box>
    </FormGroup>
  );
};

export default InputContainer;
