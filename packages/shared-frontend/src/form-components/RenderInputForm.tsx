import { Component } from '@navikt/skjemadigitalisering-shared-domain';
import { ReactNode } from 'react';
import { ValidationScopeProvider } from '../context/validation/ValidationScopeContext';
import RenderInputComponent from './RenderInputComponent';
import { inputComponentRegistry, InputComponentRegistry } from './inputComponentRegistry';

interface Props {
  // Scope props are only supplied by the top-level (page) render. Nested renders (container, row,
  // datagrid, ...) omit them and inherit the validation scope from context.
  pageKey?: string;
  pageComponents?: Component[];
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
  const content = (
    <>
      {components.map((component) => {
        const componentReactKey = component.navId ?? component.key;
        if (!componentRegistry[component.type] && component.components?.length) {
          return (
            <RenderInputForm
              key={componentReactKey}
              components={component.components ?? []}
              componentRegistry={componentRegistry}
            />
          );
        }
        return (
          <RenderInputComponent key={componentReactKey} component={component} componentRegistry={componentRegistry} />
        );
      })}
    </>
  );

  return withScope(pageKey, pageComponents, content);
};

const withScope = (pageKey: string | undefined, pageComponents: Component[] | undefined, content: ReactNode) => {
  if (pageKey !== undefined && pageComponents !== undefined) {
    return (
      <ValidationScopeProvider pageKey={pageKey} components={pageComponents}>
        {content}
      </ValidationScopeProvider>
    );
  }
  return content;
};

export default RenderInputForm;
