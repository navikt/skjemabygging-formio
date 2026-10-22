import DataGrid from '../../../components/data-grid/DataGrid';
import { ComponentDefinition } from '../../component-types';
import { InputComponentRegistry } from '../../inputComponentRegistry';
import InputDataGridRow from './InputDataGridRow';

interface InputDataGridRowsProps {
  addLabel?: string;
  componentRegistry?: InputComponentRegistry;
  onAdd: () => void;
  onRemove: (index: number) => void;
  addable: boolean;
  initEmpty?: boolean;
  removeLabel?: string;
  rowComponents: ComponentDefinition[][];
  rowIds: string[];
  rowLabel?: string;
  rows: object[];
}

const InputDataGridRows = ({
  addLabel,
  componentRegistry,
  onAdd,
  onRemove,
  addable,
  initEmpty,
  removeLabel,
  rowComponents,
  rowIds,
  rowLabel,
  rows,
}: InputDataGridRowsProps) => {
  return (
    <DataGrid addLabel={addLabel} onAdd={addable ? onAdd : undefined}>
      {rows.map((row, index) => (
        <InputDataGridRow
          key={rowIds[index]}
          componentRegistry={componentRegistry}
          components={rowComponents[index] ?? []}
          label={rowLabel}
          onRemove={() => onRemove(index)}
          removeLabel={removeLabel}
          removable={addable && (initEmpty || rows.length > 1)}
          row={row}
        />
      ))}
    </DataGrid>
  );
};

export default InputDataGridRows;
