import {
  checkCondition,
  Form,
  guid,
  Submission,
  SubmissionData,
  SubmissionMethod,
  submissionUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import {
  enrichComponentsWithBaseSubmissionPath,
  getResolvedSubmissionPath,
  toComponentDefinitions,
} from '../../../context/form-definition/formDefinitionUtils';
import { ComponentDefinition } from '../../component-types';

/**
 * A single stored data grid row: the row data, the row components with indexed submission paths,
 * and the subset of those components that is visible for this row.
 */
interface DataGridRowScope {
  dataGridComponent: ComponentDefinition;
  index: number;
  row: object;
  components: ComponentDefinition[];
  activeComponents: ComponentDefinition[];
}

interface DataGridScopeArgs {
  components: ComponentDefinition[];
  submission?: Submission;
  form: Form;
  submissionMethod?: SubmissionMethod;
}

const getRenderedDataGridRows = (rows: object[], initEmpty?: boolean) => (rows.length > 0 || initEmpty ? rows : [{}]);

const createDataGridRowIds = (count: number): string[] => Array.from({ length: count }, () => guid());

const syncDataGridRowIds = (rowIds: string[], rowCount: number): string[] => {
  if (rowIds.length === rowCount) {
    return rowIds;
  }

  if (rowIds.length > rowCount) {
    return rowIds.slice(0, rowCount);
  }

  return [...rowIds, ...createDataGridRowIds(rowCount - rowIds.length)];
};

const addDataGridRowId = (rowIds: string[]): string[] => [...rowIds, ...createDataGridRowIds(1)];

const removeDataGridRowId = (rowIds: string[], index: number): string[] => {
  if (index < 0 || index >= rowIds.length) {
    return rowIds;
  }

  return rowIds.filter((_, rowIndex) => rowIndex !== index);
};

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const shouldScopeChildRow = (component: ComponentDefinition) =>
  Boolean(component.key && (component.tree || component.input));

const getChildRow = (component: ComponentDefinition, row: object | undefined) => {
  if (!shouldScopeChildRow(component) || !isObjectRecord(row)) {
    return row;
  }

  const childRow = row[component.key];
  return isObjectRecord(childRow) ? childRow : row;
};

/**
 * Row conditionals are evaluated against the row itself, not only the root submission data, so
 * repeated rows show and hide fields independently.
 */
const getActiveRowComponents = (
  components: ComponentDefinition[],
  row: object | undefined,
  data: SubmissionData | undefined,
  form: Form,
  submissionMethod?: SubmissionMethod,
): ComponentDefinition[] =>
  components
    .filter((component) => checkCondition(component, row, data, form, undefined, undefined, { submissionMethod }))
    .map((component) =>
      component.components?.length
        ? {
            ...component,
            components: getActiveRowComponents(
              component.components,
              getChildRow(component, row),
              data,
              form,
              submissionMethod,
            ),
          }
        : component,
    );

const getDataGridRows = (component: ComponentDefinition, submission?: Submission): object[] => {
  const rows = submissionUtils.getSubmissionValue(getResolvedSubmissionPath(component), submission);
  return Array.isArray(rows) ? rows : [];
};

/**
 * Collects one scope per stored data grid row, for every data grid within the given components.
 * Rows that are not objects (for instance null placeholders from an earlier draft) are skipped,
 * since they hold no values to calculate or clear.
 */
const collectDataGridRowScopes = ({
  components,
  submission,
  form,
  submissionMethod,
}: DataGridScopeArgs): DataGridRowScope[] =>
  components.flatMap((component) => {
    if (component.type === 'datagrid') {
      const submissionPath = getResolvedSubmissionPath(component);

      return getDataGridRows(component, submission).flatMap((row, index) => {
        if (!isObjectRecord(row)) {
          return [];
        }

        const rowComponents = toComponentDefinitions(
          enrichComponentsWithBaseSubmissionPath(component.components ?? [], `${submissionPath}[${index}]`),
        );
        const activeComponents = getActiveRowComponents(rowComponents, row, submission?.data, form, submissionMethod);

        return [
          { dataGridComponent: component, index, row, components: rowComponents, activeComponents },
          ...collectDataGridRowScopes({ components: activeComponents, submission, form, submissionMethod }),
        ];
      });
    }

    return collectDataGridRowScopes({
      components: component.components ?? [],
      submission,
      form,
      submissionMethod,
    });
  });

/**
 * Input components with their resolved submission paths. Nested data grids are excluded, because
 * their rows have their own indexed paths (see {@link collectDataGridRowScopes}).
 */
const collectInputSubmissionPaths = (
  components: ComponentDefinition[],
): { component: ComponentDefinition; submissionPath: string }[] =>
  components.flatMap((component) => {
    if (component.type === 'datagrid') {
      return component.input ? [{ component, submissionPath: getResolvedSubmissionPath(component) }] : [];
    }

    return [
      ...(component.input ? [{ component, submissionPath: getResolvedSubmissionPath(component) }] : []),
      ...collectInputSubmissionPaths(component.components ?? []),
    ];
  });

export {
  addDataGridRowId,
  collectDataGridRowScopes,
  collectInputSubmissionPaths,
  getActiveRowComponents,
  getChildRow,
  getDataGridRows,
  getRenderedDataGridRows,
  isObjectRecord,
  removeDataGridRowId,
  syncDataGridRowIds,
};
export type { DataGridRowScope };
