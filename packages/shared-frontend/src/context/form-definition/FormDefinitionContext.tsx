import { Component, Form, getNavId, Panel } from '@navikt/skjemadigitalisering-shared-domain';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';
import { ComponentDefinition } from '../../form-components/component-types';
import { collectDataGridRowScopes } from '../../form-components/components/data-grid/dataGridRows';
import { useLanguage } from '../language/LanguageContext';
import { useSubmissionState } from '../state/SubmissionStateContext';
import { useSubmissionMethod } from '../submission-method/SubmissionMethodContext';
import { applyCalculatedValues } from './calculatedValues';
import {
  enrichFormWithBaseSubmissionPath,
  flattenComponentsWithBaseSubmissionPath,
  getActivePanels,
  toComponentDefinitions,
} from './formDefinitionUtils';
import { reconcilePrefilledSubmission } from './prefillSubmission';

interface FormDefinitionContextType {
  form: Form;
  activeComponents: ComponentDefinition[];
  panels: Panel[];
}

interface Props {
  children: ReactNode;
  form: Form;
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
  if (previous.form !== next.form) {
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

const FormDefinitionProvider = ({ children, form }: Props) => {
  const { currentLanguage } = useLanguage();
  const { submissionMethod } = useSubmissionMethod();
  const { submission, setSubmission } = useSubmissionState();
  const formWithBaseSubmissionPath = useMemo(() => enrichFormWithBaseSubmissionPath(form), [form]);

  const panels = useMemo(
    () => getActivePanels(formWithBaseSubmissionPath, submission, { submissionMethod }),
    [formWithBaseSubmissionPath, submission, submissionMethod],
  );

  const activeComponents = useMemo(() => toComponentDefinitions(panels), [panels]);

  const dataGridRowScopes = useMemo(
    () =>
      collectDataGridRowScopes({
        components: activeComponents,
        submission,
        form: formWithBaseSubmissionPath,
        submissionMethod,
      }),
    [activeComponents, formWithBaseSubmissionPath, submission, submissionMethod],
  );

  useLayoutEffect(() => {
    setSubmission((prev) =>
      reconcilePrefilledSubmission(formWithBaseSubmissionPath, prev, currentLanguage, {
        prefillMode: 'missing',
        submissionMethod,
      }),
    );
  }, [currentLanguage, formWithBaseSubmissionPath, setSubmission, submission, submissionMethod]);

  useEffect(() => {
    setSubmission((prev) =>
      applyCalculatedValues({
        submission: prev,
        formComponents: activeComponents,
        dataGridRowScopes,
      }),
    );
  }, [activeComponents, dataGridRowScopes, setSubmission]);

  useEffect(() => {
    const attachmentIds = new Set(
      flattenComponentsWithBaseSubmissionPath(formWithBaseSubmissionPath.components)
        .filter((component) => component.type === 'attachment')
        .map((component) => getNavId(component))
        .filter((attachmentId): attachmentId is string => !!attachmentId),
    );
    setSubmission((current) => {
      const attachments = current?.attachments;
      if (!attachments) {
        return current;
      }

      const visibleAttachments = attachments
        .filter((attachment) => attachment.attachmentId === 'personal-id' || attachmentIds.has(attachment.navId))
        .filter(
          (attachment) =>
            attachment.value !== undefined ||
            !!attachment.title?.trim() ||
            !!attachment.additionalDocumentation?.trim() ||
            (attachment.files?.length ?? 0) > 0,
        )
        .filter(
          (attachment, index, list) =>
            index === list.findIndex((candidate) => candidate.attachmentId === attachment.attachmentId),
        );

      return visibleAttachments.length === attachments.length &&
        visibleAttachments.every((attachment, index) => attachment === attachments[index])
        ? current
        : { ...current, attachments: visibleAttachments };
    });
  }, [activeComponents, formWithBaseSubmissionPath, setSubmission, submission, submissionMethod]);

  const value = useMemo(
    () => ({ form: formWithBaseSubmissionPath, activeComponents, panels }),
    [formWithBaseSubmissionPath, activeComponents, panels],
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

export {
  FormDefinitionProvider,
  useFormDefinition,
  useFormDefinitionComponents,
  useFormDefinitionForm,
  useFormDefinitionPanels,
};
export type { FormDefinitionContextType };
