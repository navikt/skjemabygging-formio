import {
  Component,
  Form,
  navFormUtils,
  numberUtils,
  Panel,
  submissionUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { createContext, ReactNode, useContext, useEffect, useLayoutEffect, useMemo } from 'react';
import { evaluateFormioCalculatedValue } from '../../utils/formioEvaluation';
import { useLanguage } from '../language/LanguageContext';
import { createUpdatedSubmission, useSubmissionState } from '../state/SubmissionStateContext';
import {
  enrichFormWithBaseSubmissionPath,
  flattenComponentsWithBaseSubmissionPath,
  getResolvedSubmissionPath,
} from './formDefinitionUtils';
import { applyPrefilledValuesToSubmission } from './prefillSubmission';

const isNumericComponent = (component: Component) =>
  component.type === 'number' || component.type === 'currency' || component.type === 'year';

const toEvaluationNumber = (component: Component, value: unknown) => {
  if (typeof value !== 'string') {
    return value;
  }

  const normalizedValue =
    component.inputType === 'numeric' || component.type === 'year'
      ? value.replace(/\s/g, '')
      : value.replace(/\s/g, '').replace(',', '.');

  if (normalizedValue === '') {
    return value;
  }

  const isValidNumber =
    component.inputType === 'numeric' || component.type === 'year'
      ? numberUtils.isValidInteger(normalizedValue)
      : numberUtils.isValidDecimal(normalizedValue);

  return isValidNumber ? Number(normalizedValue) : value;
};

interface FormDefinitionContextType {
  form: Form;
  activeComponents: Component[];
  panels: Panel[];
}

interface Props {
  children: ReactNode;
  form: Form;
}

const FormDefinitionContext = createContext<FormDefinitionContextType>({} as FormDefinitionContextType);

const FormDefinitionProvider = ({ children, form }: Props) => {
  const { currentLanguage } = useLanguage();
  const { submission, setSubmission, clearSubmissionPaths } = useSubmissionState();
  const formWithBaseSubmissionPath = useMemo(() => enrichFormWithBaseSubmissionPath(form), [form]);

  const activeComponents = useMemo(
    () => navFormUtils.getActiveComponentsFromForm(formWithBaseSubmissionPath, submission),
    [formWithBaseSubmissionPath, submission],
  );

  const panels = useMemo(
    () => navFormUtils.getAllActivePanelsFromForm(formWithBaseSubmissionPath, submission),
    [formWithBaseSubmissionPath, submission],
  );

  const calculatedComponents = useMemo(
    () =>
      flattenComponentsWithBaseSubmissionPath(formWithBaseSubmissionPath.components).filter(
        (component) => component.input && !!component.calculateValue && component.type !== 'maalgruppe',
      ),
    [formWithBaseSubmissionPath.components],
  );

  const numericComponents = useMemo(
    () =>
      flattenComponentsWithBaseSubmissionPath(formWithBaseSubmissionPath.components).filter(
        (component) => component.input && isNumericComponent(component),
      ),
    [formWithBaseSubmissionPath.components],
  );

  useLayoutEffect(() => {
    setSubmission((prev) => applyPrefilledValuesToSubmission(formWithBaseSubmissionPath, prev, currentLanguage));
  }, [currentLanguage, formWithBaseSubmissionPath, setSubmission]);

  useEffect(() => {
    if (calculatedComponents.length === 0) {
      return;
    }

    setSubmission((prev) => {
      const initialSubmission = prev ?? { data: {} };
      let nextSubmission = initialSubmission;

      calculatedComponents.forEach((component) => {
        const submissionPath = getResolvedSubmissionPath(component);
        const evaluationSubmission = numericComponents.reduce((acc, numericComponent) => {
          const numericSubmissionPath = getResolvedSubmissionPath(numericComponent);
          const rawValue = submissionUtils.getSubmissionValue(numericSubmissionPath, acc);
          const evaluationValue = toEvaluationNumber(numericComponent, rawValue);

          return rawValue === evaluationValue
            ? acc
            : createUpdatedSubmission(acc, numericSubmissionPath, evaluationValue);
        }, nextSubmission);
        const calculatedValue = evaluateFormioCalculatedValue({
          component,
          submission: evaluationSubmission,
          submissionPath,
        });
        const normalizedCalculatedValue = calculatedValue === '' ? undefined : calculatedValue;
        const currentValue = submissionUtils.getSubmissionValue(submissionPath, nextSubmission);

        if (currentValue !== normalizedCalculatedValue) {
          nextSubmission = createUpdatedSubmission(nextSubmission, submissionPath, normalizedCalculatedValue);
        }
      });

      return nextSubmission === initialSubmission ? prev : nextSubmission;
    });
  }, [calculatedComponents, numericComponents, setSubmission, submission]);

  useEffect(() => {
    const activeSubmissionPaths = new Set(
      flattenComponentsWithBaseSubmissionPath([...activeComponents, ...panels])
        .filter((component) => component.input)
        .map((component) => getResolvedSubmissionPath(component)),
    );
    const hiddenPathsToClear = flattenComponentsWithBaseSubmissionPath(formWithBaseSubmissionPath.components)
      .filter((component) => component.input && component.clearOnHide !== false)
      .map((component) => getResolvedSubmissionPath(component))
      .filter((submissionPath) => !activeSubmissionPaths.has(submissionPath));
    if (hiddenPathsToClear.length > 0) {
      clearSubmissionPaths(hiddenPathsToClear);
    }

    const activeAttachmentIds = new Set(
      flattenComponentsWithBaseSubmissionPath([...activeComponents, ...panels])
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
        .filter((attachment) => attachment.attachmentId === 'personal-id' || activeAttachmentIds.has(attachment.navId))
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
  }, [activeComponents, panels, clearSubmissionPaths, formWithBaseSubmissionPath.components, setSubmission]);

  const value = useMemo(
    () => ({ form: formWithBaseSubmissionPath, activeComponents, panels }),
    [formWithBaseSubmissionPath, activeComponents, panels],
  );

  return <FormDefinitionContext.Provider value={value}>{children}</FormDefinitionContext.Provider>;
};

const useFormDefinition = () => useContext(FormDefinitionContext);

export { FormDefinitionProvider, useFormDefinition };
export type { FormDefinitionContextType };
