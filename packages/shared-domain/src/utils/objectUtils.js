export const concatKeys = (key, parentKey) => (parentKey.length > 0 ? `${parentKey}.${key}` : key);

export const flatten = (nestedObject, callback, parentKey = "") => {
  return Object.entries(nestedObject).flatMap(([key, value]) =>
    typeof value === "object" ? flatten(value, callback, concatKeys(key, parentKey)) : callback([key, value], parentKey)
  );
};

export const addToMap = (map, obj) => ({ ...map, [obj.key]: obj.value });

const objectUtils = {
  concatKeys,
  flatten,
  addToMap,
};
export default objectUtils;
