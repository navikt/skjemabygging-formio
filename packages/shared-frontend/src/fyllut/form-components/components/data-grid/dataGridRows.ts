import { guid } from '@navikt/skjemadigitalisering-shared-domain';

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

export { addDataGridRowId, getRenderedDataGridRows, removeDataGridRowId, syncDataGridRowIds };
