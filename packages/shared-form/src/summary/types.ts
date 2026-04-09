import type { Component, FormPropertiesType } from '@navikt/skjemadigitalisering-shared-domain';

type SharedFormSummaryPrimitive = string | number | boolean | null;

interface SharedFormSummaryValue {
  label?: string;
  value?: SharedFormSummaryPrimitive;
  values?: SharedFormSummaryPrimitive[];
  html?: string;
  isEmpty?: boolean;
}

interface SharedFormSummaryFieldNode {
  type: 'field';
  key?: string;
  component: Component;
  submissionPath: string;
  label?: string;
  description?: string;
  values: SharedFormSummaryValue[];
}

interface SharedFormSummarySection {
  type: 'section';
  key?: string;
  title?: string;
  description?: string;
  children: SharedFormSummaryNode[];
}

type SharedFormSummaryNode = SharedFormSummaryFieldNode | SharedFormSummarySection;

interface SharedFormSummaryDocument {
  title?: string;
  properties?: FormPropertiesType;
  sections: SharedFormSummarySection[];
}

export type {
  SharedFormSummaryDocument,
  SharedFormSummaryFieldNode,
  SharedFormSummaryNode,
  SharedFormSummaryPrimitive,
  SharedFormSummarySection,
  SharedFormSummaryValue,
};
