const processObject = (prefix: string, obj: object | undefined | null): { [k: string]: any } => {
  if (obj) {
    const objectKeys = Object.keys(obj);
    if (objectKeys.length > 0) {
      return objectKeys
        .map((key: string) => {
          // @ts-ignore
          const value = obj[key];
          if (typeof value === 'object') {
            return processObject(`${prefix}_${key}`, value);
          }
          return { [`${prefix}_${key}`]: value };
        })
        .reduce((acc, cur) => ({ ...acc, ...cur }), {});
    }
  }
  return { [prefix]: obj };
};

export const toMeta = (prefix: string, obj: object | undefined | null) => processObject(prefix, obj);
