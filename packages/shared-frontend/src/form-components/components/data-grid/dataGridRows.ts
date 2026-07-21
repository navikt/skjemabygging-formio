const getRenderedDataGridRows = (rows: object[], initEmpty?: boolean) => (rows.length > 0 || initEmpty ? rows : [{}]);

export { getRenderedDataGridRows };
