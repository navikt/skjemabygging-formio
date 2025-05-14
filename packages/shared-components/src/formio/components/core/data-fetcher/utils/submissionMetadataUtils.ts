const createMetadataObject = (componentPath: string | undefined, data: any): Record<string, any> | undefined => {
  if (!componentPath) {
    return undefined;
  }
  const pathElements = componentPath?.split('.') || [];
  return pathElements.reduceRight((acc, path) => {
    return { [path]: acc };
  }, data);
};

export { createMetadataObject };
