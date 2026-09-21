import { Component, Form, getNavId, Panel, SubmissionMethod } from '@navikt/skjemadigitalisering-shared-domain';
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
import { useApplication } from '../application/ApplicationContext';
import { useLanguage } from '../language/LanguageContext';
import { useSubmissionState } from '../state/SubmissionStateContext';
import { applyCalculatedValues, CalculationTarget, isCalculatedComponent } from './calculatedValues';
import { collectDataGridRowScopes } from './dataGridRows';
import {
  enrichFormWithBaseSubmissionPath,
  flattenComponentsWithBaseSubmissionPath,
  getActivePanels,
  toComponentDefinitions,
} from './formDefinitionUtils';
import { applyInitialValuesToSubmission } from './initialSubmissionValues';

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
  const { logger } = useApplication();
  const { currentLanguage } = useLanguage();
  const { submission, setSubmission } = useSubmissionState();
  const reportedCalculationCyclesRef = useRef(new Set<string>());
  const formWithBaseSubmissionPath = useMemo(() => enrichFormWithBaseSubmissionPath(form), [form]);
  const hasCalculatedComponents = useMemo(
    () => flattenComponentsWithBaseSubmissionPath(formWithBaseSubmissionPath.components).some(isCalculatedComponent),
    [formWithBaseSubmissionPath],
  );

  const panels = useMemo(
    () => getActivePanels(formWithBaseSubmissionPath, submission, { submissionMethod }),
    [formWithBaseSubmissionPath, submission, submissionMethod],
  );

  const activeComponents = useMemo(() => toComponentDefinitions(panels), [panels]);

  const dataGridRowScopes = useMemo(() => {
    if (!hasCalculatedComponents) {
      return [];
    }

    return collectDataGridRowScopes({
      components: activeComponents,
      submission,
      form: formWithBaseSubmissionPath,
      submissionMethod,
    });
  }, [activeComponents, formWithBaseSubmissionPath, hasCalculatedComponents, submission, submissionMethod]);
  const reportCalculationCycle = useCallback(
    (targets: CalculationTarget[]) => {
      const componentKeys = [...new Set(targets.map(({ component }) => component.key).filter(Boolean))].sort();
      const reportKey = `${form.path}\0${componentKeys.join('\0')}`;
      if (reportedCalculationCyclesRef.current.has(reportKey)) {
        return;
      }

      reportedCalculationCyclesRef.current.add(reportKey);
      logger?.error?.('Calculated values did not converge', {
        componentKeys,
        formPath: form.path,
      });
    },
    [form.path, logger],
  );

  useLayoutEffect(() => {
    setSubmission((prev) =>
      applyInitialValuesToSubmission(formWithBaseSubmissionPath, prev, currentLanguage, {
        prefillMode: 'missing',
        submissionMethod,
      }),
    );
  }, [currentLanguage, formWithBaseSubmissionPath, setSubmission, submission, submissionMethod]);

  useEffect(() => {
    if (!hasCalculatedComponents) {
      return;
    }

    setSubmission((prev) => {
      const usesRenderedSubmission = prev === submission;
      const latestActiveComponents = usesRenderedSubmission
        ? activeComponents
        : toComponentDefinitions(getActivePanels(formWithBaseSubmissionPath, prev, { submissionMethod }));
      const latestDataGridRowScopes = usesRenderedSubmission
        ? dataGridRowScopes
        : collectDataGridRowScopes({
            components: latestActiveComponents,
            submission: prev,
            form: formWithBaseSubmissionPath,
            submissionMethod,
          });

      return applyCalculatedValues({
        submission: prev,
        formComponents: latestActiveComponents,
        dataGridRowScopes: latestDataGridRowScopes,
        onNonConvergence: reportCalculationCycle,
      });
    });
  }, [
    activeComponents,
    dataGridRowScopes,
    formWithBaseSubmissionPath,
    hasCalculatedComponents,
    reportCalculationCycle,
    setSubmission,
    submission,
    submissionMethod,
  ]);

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
