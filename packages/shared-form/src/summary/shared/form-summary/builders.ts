import type {
  Component,
  ComponentValue,
  Submission,
  TranslateFunction,
} from '@navikt/skjemadigitalisering-shared-domain';
import formComponentUtils from '../../../pdf/utils/formComponent';
import type { SharedFormSummaryFieldNode, SharedFormSummaryPrimitive } from '../../types';

type SummaryValueFormatter = (value: any) => string | number | boolean | null | undefined;

interface SummaryBuilderProps {
  component: Component;
  submissionPath: string;
  submission: Submission;
  translate: TranslateFunction;
}

interface DefaultSummaryBuilderProps extends SummaryBuilderProps {
  valueFormat?: SummaryValueFormatter;
}

const getSummaryLabel = (component: Component, translate: TranslateFunction) => {
  const { hideLabel, label } = component;

  if (!label || hideLabel) {
    return undefined;
  }

  return translate(label);
};

const toSummaryPrimitive = (value: unknown): SharedFormSummaryPrimitive | undefined => {
  if (value === null) {
    return null;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  return undefined;
};

const createFieldNode = (
  component: Component,
  submissionPath: string,
  translate: TranslateFunction,
  value: { value?: SharedFormSummaryPrimitive; html?: string },
): SharedFormSummaryFieldNode => ({
  type: 'field',
  component,
  submissionPath,
  key: component.key,
  label: getSummaryLabel(component, translate),
  description: component.description ? translate(component.description) : undefined,
  values: [value],
});

const buildDefaultSummaryNode = ({
  component,
  submissionPath,
  submission,
  translate,
  valueFormat,
}: DefaultSummaryBuilderProps): SharedFormSummaryFieldNode | undefined => {
  const submissionValue = formComponentUtils.getSubmissionValue(submissionPath, submission);

  if (submissionValue === undefined) {
    return undefined;
  }

  const formattedValue = valueFormat === undefined ? submissionValue : valueFormat(submissionValue);
  const summaryValue = toSummaryPrimitive(formattedValue);

  if (summaryValue === undefined) {
    return undefined;
  }

  return createFieldNode(component, submissionPath, translate, { value: summaryValue });
};

const getSelectedValue = (componentValues: ComponentValue[] | undefined, value: unknown) => {
  return componentValues?.find((valueObject) => String(valueObject.value) === String((value as any)?.value ?? value));
};

const buildDefaultListSummaryNode = ({
  component,
  submissionPath,
  submission,
  translate,
}: SummaryBuilderProps): SharedFormSummaryFieldNode | undefined => {
  const submissionValue = formComponentUtils.getSubmissionValue(submissionPath, submission);
  const valueObject = getSelectedValue(component.values, submissionValue);

  if (!valueObject?.label) {
    return undefined;
  }

  return createFieldNode(component, submissionPath, translate, { value: translate(valueObject.label) });
};

const buildDefaultSelectSummaryNode = ({
  component,
  submissionPath,
  submission,
  translate,
}: SummaryBuilderProps): SharedFormSummaryFieldNode | undefined => {
  const submissionValue = formComponentUtils.getSubmissionValue(submissionPath, submission);
  const selectedLabel = (submissionValue as { label?: string } | undefined)?.label;

  if (!selectedLabel) {
    return undefined;
  }

  return createFieldNode(component, submissionPath, translate, { value: translate(selectedLabel) });
};

const buildDefaultHtmlSummaryNode = ({
  component,
  submissionPath,
  translate,
}: Omit<SummaryBuilderProps, 'submission'>) => {
  const { textDisplay, content } = component;

  if (!content || textDisplay === undefined || textDisplay === 'form') {
    return undefined;
  }

  return createFieldNode(component, submissionPath, translate, { html: translate(content) });
};

export {
  buildDefaultHtmlSummaryNode,
  buildDefaultListSummaryNode,
  buildDefaultSelectSummaryNode,
  buildDefaultSummaryNode,
  getSummaryLabel,
};

export type { DefaultSummaryBuilderProps, SummaryBuilderProps, SummaryValueFormatter };
