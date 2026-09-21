import {
  checkCondition,
  Form,
  Submission,
  SubmissionData,
  SubmissionMethod,
  submissionUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { ComponentDefinition } from '../../form-components/component-types';
import {
  enrichComponentsWithBaseSubmissionPath,
  getResolvedSubmissionPath,
  toComponentDefinitions,
} from './formDefinitionUtils';

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
  includeImplicitRows?: boolean;
}

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const shouldScopeChildRow = (component: ComponentDefinition) =>
  Boolean(component.key && (('tree' in component && component.tree) || component.input));

const getChildRow = (component: ComponentDefinition, row: object | undefined) => {
  if (!shouldScopeChildRow(component) || !isObjectRecord(row)) {
    return row;
  }

  const childRow = row[component.key];
  return isObjectRecord(childRow) ? childRow : row;
};

/**
 * Row conditionals are evaluated against the row itself, not only the root submission data, so
 * repeated rows show and hide fields independently. Nested data grids retain their child
 * templates here: their conditionals must instead be evaluated against each nested row.
 */
const getActiveRowComponents = (
  components: ComponentDefinition[],
  row: object | undefined,
  data: SubmissionData | undefined,
  form: Form,
  submissionMethod?: SubmissionMethod,
  submission?: Submission,
): ComponentDefinition[] =>
  components
    .filter((component) => checkCondition(component, row, data, form, undefined, submission, { submissionMethod }))
    .map((component) => {
      if (component.type === 'datagrid' || !component.components?.length) {
        return component;
      }

      return {
        ...component,
        components: getActiveRowComponents(
          component.components,
          getChildRow(component, row),
          data,
          form,
          submissionMethod,
          submission,
        ),
      };
    });

const getDataGridRows = (component: ComponentDefinition, submission?: Submission): object[] => {
  const rows = submissionUtils.getSubmissionValue(getResolvedSubmissionPath(component), submission);
  return Array.isArray(rows) ? rows : [];
};

/**
 * Collects one scope per stored data grid row, for every data grid within the given components.
 * Rows that are not objects (for instance null placeholders from an earlier draft) are skipped,
 * since they hold no values to calculate or clear. Initial-value reconciliation can opt into the
 * implicit first row rendered by an empty data grid.
 */
const collectDataGridRowScopes = ({
  components,
  submission,
  form,
  submissionMethod,
  includeImplicitRows = false,
}: DataGridScopeArgs): DataGridRowScope[] =>
  components.flatMap((component) => {
    if (component.type === 'datagrid') {
      const submissionPath = getResolvedSubmissionPath(component);
      const rows = getDataGridRows(component, submission);
      const scopedRows = includeImplicitRows ? getRenderedDataGridRows(rows, component.initEmpty) : rows;

      return scopedRows.flatMap((row, index) => {
        if (!isObjectRecord(row)) {
          return [];
        }

        const rowComponents = toComponentDefinitions(
          enrichComponentsWithBaseSubmissionPath(component.components ?? [], `${submissionPath}[${index}]`),
        );
        const activeComponents = getActiveRowComponents(
          rowComponents,
          row,
          submission?.data,
          form,
          submissionMethod,
          submission,
        );

        return [
          { dataGridComponent: component, index, row, components: rowComponents, activeComponents },
          ...collectDataGridRowScopes({
            components: activeComponents,
            submission,
            form,
            submissionMethod,
            includeImplicitRows,
          }),
        ];
      });
    }

    return collectDataGridRowScopes({
      components: component.components ?? [],
      submission,
      form,
      submissionMethod,
      includeImplicitRows,
    });
  });

/**
 * Input components and their resolved paths within the current scope. Data grid children are
 * intentionally excluded: only a concrete row can give them their indexed submission paths.
 */
const collectInputSubmissionPathsInCurrentScope = (
  components: ComponentDefinition[],
): { component: ComponentDefinition; submissionPath: string }[] =>
  components.flatMap((component) => {
    if (component.type === 'datagrid') {
      return component.input ? [{ component, submissionPath: getResolvedSubmissionPath(component) }] : [];
    }

    return [
      ...(component.input ? [{ component, submissionPath: getResolvedSubmissionPath(component) }] : []),
      ...collectInputSubmissionPathsInCurrentScope(component.components ?? []),
    ];
  });

const getRenderedDataGridRows = (rows: object[], initEmpty?: boolean) => (rows.length > 0 || initEmpty ? rows : [{}]);

export {
  collectDataGridRowScopes,
  collectInputSubmissionPathsInCurrentScope,
  getActiveRowComponents,
  getChildRow,
  getDataGridRows,
  getRenderedDataGridRows,
  isObjectRecord,
};
export type { DataGridRowScope };
