import { ReactNode } from 'react';
import { ValidationScopeProvider } from '../context/validation/ValidationScopeContext';
import { ComponentDefinition } from './component-types';
import { inputComponentRegistry, InputComponentRegistry } from './inputComponentRegistry';
import { PageComponentsProvider } from './PageComponentsContext';
import RenderInputComponent from './RenderInputComponent';

interface Props {
  // The page key is only supplied by the top-level (page) render. Nested renders (container, row,
  // datagrid, ...) omit it and inherit the validation scope and the page components from context.
  pageKey?: string;
  components: ComponentDefinition[];
  componentRegistry?: InputComponentRegistry;
}

// Renders editable inputs for a set of enriched active components. Path resolution happens in the
// input registry so dynamic contexts can later override submissionPath when needed.
const RenderInputForm = ({ pageKey, components, componentRegistry = inputComponentRegistry }: Props) => {
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

  return withPageScope(pageKey, components, content);
};

// A new scope instance per page: leaving a page keeps its registered fields (the summary page
// validates every page), while fields that disappear within the page unregister themselves.
const withPageScope = (pageKey: string | undefined, components: ComponentDefinition[], content: ReactNode) => {
  if (pageKey === undefined) {
    return content;
  }

  return (
    <ValidationScopeProvider key={pageKey} pageKey={pageKey}>
      <PageComponentsProvider components={components}>{content}</PageComponentsProvider>
    </ValidationScopeProvider>
  );
};

export default RenderInputForm;
