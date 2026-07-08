import { Component, Panel } from '@navikt/skjemadigitalisering-shared-domain';
import RenderInputComponent from './RenderInputComponent';
import { InputComponentRegistry } from './inputComponentRegistry';

interface Props {
  pageKey: string;
  pageComponents: Component[];
  components: Component[];
  componentRegistry?: InputComponentRegistry;
}

// Renders editable inputs for a set of (already active) components. Panels/containers recurse into
// their children; leaf inputs are looked up in the registry.
const RenderInputForm = ({ pageKey, pageComponents, components, componentRegistry }: Props) => {
  return (
    <>
      {components.map((component) => {
        if ((component as Panel).components?.length) {
          return (
            <RenderInputForm
              key={component.key}
              pageKey={pageKey}
              pageComponents={pageComponents}
              components={(component as Panel).components ?? []}
              componentRegistry={componentRegistry}
            />
          );
        }
        return (
          <RenderInputComponent
            key={component.key}
            component={component}
            pageKey={pageKey}
            pageComponents={pageComponents}
            componentRegistry={componentRegistry}
          />
        );
      })}
    </>
  );
};

export default RenderInputForm;
