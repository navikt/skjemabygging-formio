import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useDevtoolsEnabled, useDevtoolsReport } from '../../context/devtools/DevtoolsContext';
import {
  useFormDefinitionComponents,
  useFormDefinitionPanels,
  useFormDefinitionSubmissionMethod,
} from '../../context/form-definition/FormDefinitionContext';
import { ComponentDefinition } from '../../form-components/component-types';
import { useFormActions } from '../context/form-actions/FormActionsContext';
import { useNologinToken } from '../context/nologin-token/NologinTokenContext';

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
  const location = useLocation();
  const { status, error } = useFormActions();
  const { tokenExpiration } = useNologinToken();

  useEffect(() => {
    reportToDevtools('formDefinition', {
      submissionMethod,
      activePanels: panels.map((panel) => panel.key),
      activeComponents: summarizeComponents(activeComponents),
    });
  }, [activeComponents, panels, reportToDevtools, submissionMethod]);

  useEffect(() => {
    const { pathname, search, hash, state } = location;
    reportToDevtools('route', { pathname, search, hash, state }, 'change');
  }, [location, reportToDevtools]);

  useEffect(() => {
    reportToDevtools('formActions', { status, error });
  }, [error, reportToDevtools, status]);

  // Only the expiry time. Never report the token itself.
  useEffect(() => {
    reportToDevtools('session', {
      tokenExpiration,
      expiresAt: tokenExpiration ? new Date(tokenExpiration * 1000).toISOString() : undefined,
    });
  }, [reportToDevtools, tokenExpiration]);

  return null;
};

// Keeps the subscriptions above out of the tree when no inspector is connected.
const DevtoolsBridge = () => (useDevtoolsEnabled() ? <DevtoolsReporter /> : null);

export default DevtoolsBridge;
