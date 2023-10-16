function generateDiff(originalComponent, editedComponent) {
  return Object.keys({ ...originalComponent, ...editedComponent }).reduce((acc, key) => {
    if (key === 'id') return { ...acc, [key]: originalComponent[key] };
    if (originalComponent[key] !== editedComponent[key]) {
      if (
        typeof originalComponent[key] === 'object' &&
        !Array.isArray(originalComponent[key]) &&
        originalComponent[key] !== null
      ) {
        return {
          ...acc,
          [key]: generateDiff(originalComponent[key], editedComponent[key]),
        };
      }
      return {
        ...acc,
        [`${key}_ORIGINAL`]: originalComponent[key],
        [`${key}_NEW`]: editedComponent[key],
      };
    }
    if (key === 'key' || key === 'label') return { ...acc, [key]: originalComponent[key] };
    return acc;
  }, {});
}

export { generateDiff };
