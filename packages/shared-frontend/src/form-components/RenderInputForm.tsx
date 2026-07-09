import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import RenderInputComponent from './RenderInputComponent';
import { inputComponentRegistry, InputComponentRegistry } from './inputComponentRegistry';

interface Props {
  pageKey: string;
  pageComponents: Component[];
  components: Component[];
  componentRegistry?: InputComponentRegistry;
}

// Renders editable inputs for a set of enriched active components. Path resolution happens in the
// input registry so dynamic contexts can later override submissionPath when needed.
const RenderInputForm = ({
  pageKey,
  pageComponents,
  components,
  componentRegistry = inputComponentRegistry,
}: Props) => {
  return (
    <>
      {components.map((component) => {
        if (!componentRegistry[component.type] && component.components?.length) {
          return (
            <RenderInputForm
              key={component.key}
              pageKey={pageKey}
              pageComponents={pageComponents}
              components={component.components ?? []}
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
