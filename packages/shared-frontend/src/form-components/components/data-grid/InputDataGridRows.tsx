import { Box, Button } from '@navikt/ds-react';
import { TEXTS } from '@navikt/skjemadigitalisering-shared-domain';
import { useLanguage } from '../../../context/language/LanguageContext';
import { ComponentDefinition } from '../../component-types';
import { InputComponentRegistry } from '../../inputComponentRegistry';
import styles from './InputDataGrid.module.css';
import InputDataGridRow from './InputDataGridRow';

interface InputDataGridRowsProps {
  addLabel?: string;
  componentRegistry?: InputComponentRegistry;
  onAdd: () => void;
  onRemove: (index: number) => void;
  removable: boolean;
  removeLabel?: string;
  rowComponents: ComponentDefinition[][];
  rowIds: string[];
  rowLabel: string;
  rows: object[];
}

const InputDataGridRows = ({
  addLabel,
  componentRegistry,
  onAdd,
  onRemove,
  removable,
  removeLabel,
  rowComponents,
  rowIds,
  rowLabel,
  rows,
}: InputDataGridRowsProps) => {
  const { translate } = useLanguage();

  return (
    <>
      <div className={styles.rows}>
        {rows.map((row, index) => (
          <InputDataGridRow
            key={rowIds[index]}
            componentRegistry={componentRegistry}
            components={rowComponents[index] ?? []}
            index={index}
            label={rowLabel}
            onRemove={() => onRemove(index)}
            removeLabel={removeLabel}
            removable={removable}
            row={row}
          />
        ))}
      </div>

      {removable && (
        <Box marginBlock="space-16 space-0">
          <Button type="button" variant="secondary" onClick={onAdd}>
            {translate(addLabel || TEXTS.common.add)}
          </Button>
        </Box>
      )}
    </>
  );
};

export default InputDataGridRows;
