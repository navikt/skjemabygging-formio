const getSelectedValuesMap = (
  dataValues: Array<{ label: string; value: string }>,
  selectedValues: string[],
): Record<string, boolean> => {
  return dataValues.reduce((acc, { value }) => ({ ...acc, [value]: selectedValues.includes(value) }), {});
};

const getSelectedValuesAsList = (values?: Record<string, boolean>): string[] => {
  if (!values) return [];
  return Object.entries(values)
    .filter(([, value]) => value)
    .map(([key]) => key);
};

export { getSelectedValuesAsList, getSelectedValuesMap };
