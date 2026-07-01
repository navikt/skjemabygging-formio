import { Component, Panel } from '@navikt/skjemadigitalisering-shared-domain';
import RenderInputComponent from './RenderInputComponent';
import { InputComponentRegistry } from './inputComponentRegistry';

interface Props {
  components: Component[];
  componentRegistry?: InputComponentRegistry;
}

// Renders editable inputs for a set of (already active) components. Panels/containers recurse into
// their children; leaf inputs are looked up in the registry.
const RenderInputForm = ({ components, componentRegistry }: Props) => {
  return (
    <>
      {components.map((component) => {
        if ((component as Panel).components?.length) {
          return (
            <RenderInputForm
              key={component.key}
              components={(component as Panel).components ?? []}
              componentRegistry={componentRegistry}
            />
          );
        }
        return <RenderInputComponent key={component.key} component={component} componentRegistry={componentRegistry} />;
      })}
    </>
  );
};

export default RenderInputForm;
