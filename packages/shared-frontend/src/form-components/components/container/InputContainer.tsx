import { Box } from '@navikt/ds-react';
import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { InputComponentRegistry } from '../../inputComponentRegistry';
import RenderInputForm from '../../RenderInputForm';

interface InputContainerProps {
  component: Component;
  pageKey: string;
  pageComponents: Component[];
  componentRegistry?: InputComponentRegistry;
}

const InputContainer = ({ component, pageKey, pageComponents, componentRegistry }: InputContainerProps) => {
  if (!component.components?.length) {
    return null;
  }

  return (
    <Box data-cy="input-container">
      <RenderInputForm
        pageKey={pageKey}
        pageComponents={pageComponents}
        components={component.components}
        componentRegistry={componentRegistry}
      />
    </Box>
  );
};

export default InputContainer;
