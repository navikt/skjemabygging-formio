const processObject = (prefix: string, obj: object): { [k: string]: any } => {
  return Object.keys(obj)
    .map((key: string) => {
      // @ts-ignore
      const value = obj[key];
      if (typeof value === "object") {
        return processObject(`${prefix}_${key}`, value);
      }
      return { [`${prefix}_${key}`]: value };
    })
    .reduce((acc, cur) => ({ ...acc, ...cur }), {});
};

export const toMeta = (prefix: string, obj: object) => processObject(prefix, obj);
