import { Box, Button, Heading, Label } from '@navikt/ds-react';
import { Component, submissionUtils } from '@navikt/skjemadigitalisering-shared-domain';
import TranslatedDescription from '../../../components/input/TranslatedDescription';
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
import styles from './InputDataGrid.module.css';

interface InputDataGridProps {
  component: Component;
  componentRegistry?: InputComponentRegistry;
}

const InputDataGrid = ({ component, componentRegistry }: InputDataGridProps) => {
  const { translate } = useLanguage();
  const { submission, updateSubmission } = useSubmissionState();
  const { handleFieldChange } = useValidation();
  const { pageKey, components: pageComponents } = useValidationScope();
  const { components, label, description, addAnother, removeAnother, disableAddingRemovingRows, rowTitle } = component;
  const submissionPath = getResolvedSubmissionPath(component);
  const rows = submissionUtils.getSubmissionValue(submissionPath, submission);
  const dataGridRows = Array.isArray(rows) ? rows : [];

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
        {dataGridRows.map((_, index) => {
          const rowComponents = enrichComponentsWithBaseSubmissionPath(components, `${submissionPath}[${index}]`);

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

export default InputDataGrid;
