import { Component, Form, Panel, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';
import { ComponentDefinition } from '../../form-components/component-types';
import { useSubmissionState } from '../state/SubmissionStateContext';
import { enrichFormWithBaseSubmissionPath, getActivePanels, toComponentDefinitions } from './formDefinitionUtils';
import { useFormDefinitionSubmissionSynchronization } from './useFormDefinitionSubmissionSynchronization';

interface FormDefinitionContextType {
  form: Form;
  activeComponents: ComponentDefinition[];
  panels: Panel[];
  submissionMethod?: SubmissionMethod;
}

interface Props {
  children: ReactNode;
  form: Form;
  submissionMethod?: SubmissionMethod;
}

interface FormDefinitionStore {
  subscribe: (listener: () => void) => () => void;
  getVersion: () => number;
  getValue: () => FormDefinitionContextType;
}

const FormDefinitionContext = createContext<FormDefinitionStore | undefined>(undefined);

const reuseActiveComponentReferences = <T extends Component>(previous: T[], next: T[]): T[] => {
  if (previous.length !== next.length) {
    return next;
  }

  const stableComponents = next.map((component, index) => {
    const previousComponent = previous[index];
    if (
      !previousComponent ||
      previousComponent.type !== component.type ||
      previousComponent.key !== component.key ||
      previousComponent.navId !== component.navId
    ) {
      return component;
    }

    const previousChildren = previousComponent.components ?? [];
    const nextChildren = component.components ?? [];
    const stableChildren = reuseActiveComponentReferences(previousChildren, nextChildren);
    return stableChildren === previousChildren
      ? previousComponent
      : ({ ...component, components: stableChildren } as T);
  });

  return stableComponents.every((component, index) => component === previous[index]) ? previous : stableComponents;
};

const stabilizeValue = (
  previous: FormDefinitionContextType,
  next: FormDefinitionContextType,
): FormDefinitionContextType => {
  if (previous.form !== next.form || previous.submissionMethod !== next.submissionMethod) {
    return next;
  }

  const panels = reuseActiveComponentReferences(previous.panels, next.panels);
  return panels === previous.panels
    ? previous
    : {
        ...next,
        panels,
        activeComponents: toComponentDefinitions(panels),
      };
};

const FormDefinitionProvider = ({ children, form, submissionMethod }: Props) => {
  const { submission } = useSubmissionState();
  const formWithBaseSubmissionPath = useMemo(() => enrichFormWithBaseSubmissionPath(form), [form]);
  const panels = useMemo(
    () => getActivePanels(formWithBaseSubmissionPath, submission, { submissionMethod }),
    [formWithBaseSubmissionPath, submission, submissionMethod],
  );
  const activeComponents = toComponentDefinitions(panels);

  useFormDefinitionSubmissionSynchronization({
    activeComponents,
    form: formWithBaseSubmissionPath,
    submissionMethod,
  });

  const value = useMemo<FormDefinitionContextType>(
    () => ({ form: formWithBaseSubmissionPath, activeComponents, panels, submissionMethod }),
    [formWithBaseSubmissionPath, activeComponents, panels, submissionMethod],
  );

  const valueRef = useRef(value);
  const publishedValueRef = useRef(value);
  const listenersRef = useRef(new Set<() => void>());
  const versionRef = useRef(0);
  const store = useMemo<FormDefinitionStore>(
    () => ({
      subscribe: (listener) => {
        listenersRef.current.add(listener);
        return () => {
          listenersRef.current.delete(listener);
        };
      },
      getVersion: () => versionRef.current,
      getValue: () => valueRef.current,
    }),
    [],
  );

  useLayoutEffect(() => {
    const stableValue = stabilizeValue(publishedValueRef.current, value);
    valueRef.current = stableValue;
    if (publishedValueRef.current === stableValue) {
      return;
    }
    publishedValueRef.current = stableValue;
    versionRef.current += 1;
    listenersRef.current.forEach((listener) => listener());
  }, [value]);

  return <FormDefinitionContext.Provider value={store}>{children}</FormDefinitionContext.Provider>;
};

const useFormDefinitionStore = (): FormDefinitionStore => {
  const store = useContext(FormDefinitionContext);
  if (!store) {
    throw new Error('Form definition context is required to use the form definition.');
  }
  return store;
};

const useFormDefinition = (): FormDefinitionContextType => {
  const store = useFormDefinitionStore();
  useSyncExternalStore(store.subscribe, store.getVersion, store.getVersion);
  return store.getValue();
};

const useFormDefinitionValue = <Key extends keyof FormDefinitionContextType>(
  key: Key,
): FormDefinitionContextType[Key] => {
  const store = useFormDefinitionStore();
  const getSnapshot = useCallback(() => store.getValue()[key], [key, store]);
  return useSyncExternalStore(store.subscribe, getSnapshot, getSnapshot);
};

const useFormDefinitionForm = (): Form => useFormDefinitionValue('form');
const useFormDefinitionPanels = (): Panel[] => useFormDefinitionValue('panels');
const useFormDefinitionComponents = (): ComponentDefinition[] => useFormDefinitionValue('activeComponents');
const useFormDefinitionSubmissionMethod = (): SubmissionMethod | undefined =>
  useFormDefinitionValue('submissionMethod');

export {
  FormDefinitionProvider,
  useFormDefinition,
  useFormDefinitionComponents,
  useFormDefinitionForm,
  useFormDefinitionPanels,
  useFormDefinitionSubmissionMethod,
};
export type { FormDefinitionContextType };
