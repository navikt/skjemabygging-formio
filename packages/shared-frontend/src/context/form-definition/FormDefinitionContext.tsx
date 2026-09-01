import { Form, navFormUtils, Panel } from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useContext, useEffect, useLayoutEffect, useMemo } from 'react';
import { ComponentDefinition } from '../../form-components/component-types';
import { collectDataGridRowScopes } from '../../form-components/components/data-grid/dataGridRows';
import { useLanguage } from '../language/LanguageContext';
import { useSubmissionState } from '../state/SubmissionStateContext';
import { useSubmissionMethod } from '../submission-method/SubmissionMethodContext';
import { applyCalculatedValues } from './calculatedValues';
import {
  enrichFormWithBaseSubmissionPath,
  flattenComponentsWithBaseSubmissionPath,
  toComponentDefinitions,
} from './formDefinitionUtils';
import { collectHiddenSubmissionPaths } from './hiddenSubmissionPaths';
import { applyPrefilledValuesToSubmission } from './prefillSubmission';

interface FormDefinitionContextType {
  form: Form;
  activeComponents: ComponentDefinition[];
  panels: Panel[];
}

interface Props {
  children: ReactNode;
  form: Form;
}

const FormDefinitionContext = createContext<FormDefinitionContextType>({} as FormDefinitionContextType);

const FormDefinitionProvider = ({ children, form }: Props) => {
  const { currentLanguage } = useLanguage();
  const { submissionMethod } = useSubmissionMethod();
  const { submission, setSubmission, clearSubmissionPaths } = useSubmissionState();
  const formWithBaseSubmissionPath = useMemo(() => enrichFormWithBaseSubmissionPath(form), [form]);

  const activeComponents = useMemo(
    () =>
      toComponentDefinitions(
        navFormUtils.getActiveComponentsFromForm(formWithBaseSubmissionPath, submission, { submissionMethod }),
      ),
    [formWithBaseSubmissionPath, submission, submissionMethod],
  );

  const panels = useMemo(
    () => navFormUtils.getAllActivePanelsFromForm(formWithBaseSubmissionPath, submission, { submissionMethod }),
    [formWithBaseSubmissionPath, submission, submissionMethod],
  );

  const dataGridRowScopes = useMemo(
    () =>
      collectDataGridRowScopes({
        components: toComponentDefinitions([...activeComponents, ...panels]),
        submission,
        form: formWithBaseSubmissionPath,
        submissionMethod,
      }),
    [activeComponents, panels, formWithBaseSubmissionPath, submission, submissionMethod],
  );

  useLayoutEffect(() => {
    setSubmission((prev) => applyPrefilledValuesToSubmission(formWithBaseSubmissionPath, prev, currentLanguage));
  }, [currentLanguage, formWithBaseSubmissionPath, setSubmission]);

  useEffect(() => {
    setSubmission((prev) =>
      applyCalculatedValues({
        submission: prev,
        formComponents: toComponentDefinitions([...activeComponents, ...panels]),
        dataGridRowScopes,
      }),
    );
  }, [activeComponents, dataGridRowScopes, panels, setSubmission]);

  useEffect(() => {
    const hiddenPathsToClear = collectHiddenSubmissionPaths({
      form: formWithBaseSubmissionPath,
      activeComponents,
      panels,
      submission,
      submissionMethod,
    });
    if (hiddenPathsToClear.length > 0) {
      clearSubmissionPaths(hiddenPathsToClear);
    }

    const attachmentIds = new Set(
      flattenComponentsWithBaseSubmissionPath(formWithBaseSubmissionPath.components)
        .filter((component) => component.type === 'attachment')
        .map((component) => navFormUtils.getNavId(component))
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
  }, [
    activeComponents,
    panels,
    clearSubmissionPaths,
    formWithBaseSubmissionPath,
    setSubmission,
    submission,
    submissionMethod,
  ]);

  const value = useMemo(
    () => ({ form: formWithBaseSubmissionPath, activeComponents, panels }),
    [formWithBaseSubmissionPath, activeComponents, panels],
  );

  return <FormDefinitionContext.Provider value={value}>{children}</FormDefinitionContext.Provider>;
};

const useFormDefinition = () => useContext(FormDefinitionContext);

export { FormDefinitionProvider, useFormDefinition };
export type { FormDefinitionContextType };
