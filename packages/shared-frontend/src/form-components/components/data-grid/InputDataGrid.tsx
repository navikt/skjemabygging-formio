import { Box, Button, Heading, Label } from '@navikt/ds-react';
import {
  checkCondition,
  Component,
  Form,
  SubmissionData,
  submissionUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import TranslatedDescription from '../../../components/shared/TranslatedDescription';
import { useFormDefinition } from '../../../context/form-definition/FormDefinitionContext';
import {
  enrichComponentsWithBaseSubmissionPath,
  getResolvedSubmissionPath,
} from '../../../context/form-definition/formDefinitionUtils';
import { useLanguage } from '../../../context/language/LanguageContext';
import { createUpdatedSubmission, useSubmissionState } from '../../../context/state/SubmissionStateContext';
import { useValidation } from '../../../context/validation/ValidationContext';
import { useValidationScope } from '../../../context/validation/ValidationScopeContext';
import { InputComponentRegistry } from '../../inputComponentRegistry';
import RenderInputForm from '../../RenderInputForm';
import { getRenderedDataGridRows } from './dataGridRows';
import styles from './InputDataGrid.module.css';

interface InputDataGridProps {
  component: Component;
  componentRegistry?: InputComponentRegistry;
}

const InputDataGrid = ({ component, componentRegistry }: InputDataGridProps) => {
  const { translate } = useLanguage();
  const { submission, updateSubmission } = useSubmissionState();
  const { form } = useFormDefinition();
  const { handleFieldChange } = useValidation();
  const { pageKey, components: pageComponents } = useValidationScope();
  const { components, label, description, addAnother, removeAnother, disableAddingRemovingRows, rowTitle } = component;
  const submissionPath = getResolvedSubmissionPath(component);
  const rows = submissionUtils.getSubmissionValue(submissionPath, submission);
  const dataGridRows = Array.isArray(rows) ? rows : [];
  const renderedRows = getRenderedDataGridRows(dataGridRows, component.initEmpty);

  const updateRows = (nextRows: object[]) => {
    const nextSubmission = createUpdatedSubmission(submission, submissionPath, nextRows);
    updateSubmission(submissionPath, nextRows);
    handleFieldChange(pageKey, pageComponents, nextSubmission);
  };

  const addRow = () => updateRows([...dataGridRows, {}]);
  const removeRow = (index: number) => updateRows(dataGridRows.filter((_, rowIndex) => rowIndex !== index));

  if (!components?.length) {
    return null;
  }

  return (
    <Box marginBlock="space-0 space-40" data-cy="input-datagrid">
      {(label || description) && (
        <div className={styles.header}>
          {label && <Label as="div">{translate(label)}</Label>}
          {description && (
            <div className={styles.description}>
              <TranslatedDescription>{description}</TranslatedDescription>
            </div>
          )}
        </div>
      )}

      <div className={styles.rows}>
        {renderedRows.map((row, index) => {
          const rowComponents = getActiveRowComponents(
            enrichComponentsWithBaseSubmissionPath(components, `${submissionPath}[${index}]`),
            row,
            submission?.data,
            form,
          );

          return (
            <div key={index} className={styles.row}>
              <div className={styles.rowHeader}>
                <Heading level="3" size="small">
                  {translate(rowTitle || label || component.key)} {index + 1}
                </Heading>
                {!disableAddingRemovingRows && (
                  <Button type="button" variant="secondary" size="small" onClick={() => removeRow(index)}>
                    {translate(removeAnother || 'Fjern')}
                  </Button>
                )}
              </div>
              <RenderInputForm components={rowComponents} componentRegistry={componentRegistry} />
            </div>
          );
        })}
      </div>

      {!disableAddingRemovingRows && (
        <Box marginBlock="space-16 space-0">
          <Button type="button" variant="secondary" onClick={addRow}>
            {translate(addAnother || 'Legg til')}
          </Button>
        </Box>
      )}
    </Box>
  );
};

const getActiveRowComponents = (
  components: Component[],
  row: object | undefined,
  data: SubmissionData | undefined,
  form: Form,
) =>
  components
    .filter((component) => checkCondition(component, row, data, form))
    .map((component) =>
      component.components?.length
        ? {
            ...component,
            components: getActiveRowComponents(component.components, row, data, form),
          }
        : component,
    );
export default InputDataGrid;
export { getActiveRowComponents, getRenderedDataGridRows };
