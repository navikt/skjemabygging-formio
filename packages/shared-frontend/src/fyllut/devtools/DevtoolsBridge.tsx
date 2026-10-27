import { useEffect } from 'react';
import { useDevtoolsEnabled, useDevtoolsReport } from '../../context/devtools/DevtoolsContext';
import {
  useFormDefinitionComponents,
  useFormDefinitionPanels,
  useFormDefinitionSubmissionMethod,
} from '../../context/form-definition/FormDefinitionContext';
import { ComponentDefinition } from '../../form-components/component-types';

interface ComponentSummary {
  key: string;
  type: string;
  components?: ComponentSummary[];
}

// The full definitions are large and static; the active tree is what conditionals change.
const summarizeComponents = (components: ComponentDefinition[]): ComponentSummary[] =>
  components.map(({ key, type, components: children }) => ({
    key,
    type,
    ...(children?.length ? { components: summarizeComponents(children) } : {}),
  }));

const DevtoolsReporter = () => {
  const reportToDevtools = useDevtoolsReport();
  const activeComponents = useFormDefinitionComponents();
  const panels = useFormDefinitionPanels();
  const submissionMethod = useFormDefinitionSubmissionMethod();

  useEffect(() => {
    reportToDevtools('formDefinition', {
      submissionMethod,
      activePanels: panels.map((panel) => panel.key),
      activeComponents: summarizeComponents(activeComponents),
    });
  }, [activeComponents, panels, reportToDevtools, submissionMethod]);

  return null;
};

// Keeps the subscriptions above out of the tree when no inspector is connected.
const DevtoolsBridge = () => (useDevtoolsEnabled() ? <DevtoolsReporter /> : null);

export default DevtoolsBridge;
