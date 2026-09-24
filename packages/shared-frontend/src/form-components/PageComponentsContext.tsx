import { createContext, ReactNode, useContext } from 'react';
import { ComponentDefinition } from './component-types';

const PageComponentsContext = createContext<ComponentDefinition[]>([]);

interface Props {
  components: ComponentDefinition[];
  children: ReactNode;
}

/**
 * The components of the page currently being rendered. A few components are configured relative to
 * another component on the same page (a date picker that must be after another date), so they need
 * to resolve that component's submission path. Nested renders inherit the page from context.
 */
const PageComponentsProvider = ({ components, children }: Props) => (
  <PageComponentsContext.Provider value={components}>{children}</PageComponentsContext.Provider>
);

const usePageComponents = (): ComponentDefinition[] => useContext(PageComponentsContext);

export { PageComponentsProvider, usePageComponents };
