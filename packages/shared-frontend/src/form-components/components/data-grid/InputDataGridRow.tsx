import { Button, Heading } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { getActiveRowComponents } from '../../../context/form-definition/dataGridRows';
import {
  useFormDefinitionForm,
  useFormDefinitionSubmissionMethod,
} from '../../../context/form-definition/FormDefinitionContext';
import { useLanguage } from '../../../context/language/LanguageContext';
import { useSubmissionState } from '../../../context/state/SubmissionStateContext';
import { ComponentDefinition } from '../../component-types';
import { InputComponentRegistry } from '../../inputComponentRegistry';
import RenderInputForm from '../../RenderInputForm';
import styles from './InputDataGrid.module.css';

interface InputDataGridRowProps {
  componentRegistry?: InputComponentRegistry;
  components: ComponentDefinition[];
  index: number;
  label: string;
  onRemove: () => void;
  removeLabel?: string;
  removable: boolean;
  row: object;
}

const InputDataGridRow = ({
  componentRegistry,
  components,
  index,
  label,
  onRemove,
  removeLabel,
  removable,
  row,
}: InputDataGridRowProps) => {
  const { translate } = useLanguage();
  const { submission } = useSubmissionState();
  const form = useFormDefinitionForm();
  const submissionMethod = useFormDefinitionSubmissionMethod();
  const rowComponents = getActiveRowComponents(components, row, submission?.data, form, submissionMethod, submission);

  return (
    <div className={styles.row}>
      <div className={styles.rowHeader}>
        <Heading level="3" size="small" className="aksel-fieldset__legend-formio-template">
          {translate(label)} {index + 1}
        </Heading>
        {removable && (
          <Button type="button" variant="secondary" size="small" onClick={onRemove}>
            {translate(removeLabel || TEXTS.common.remove)}
          </Button>
        )}
      </div>
      <RenderInputForm components={rowComponents} componentRegistry={componentRegistry} />
    </div>
  );
};

export default InputDataGridRow;
