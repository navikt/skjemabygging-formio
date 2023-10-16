export const concatKeys = (key, parentKey) => (parentKey.length > 0 ? `${parentKey}.${key}` : key);

export const addToMap = (map, obj) => ({ ...map, [obj.key]: obj.value });

export const flattenToArray = (nestedObject, callback, parentKey = '') => {
  return Object.entries(nestedObject).flatMap(([key, value]) =>
    typeof value === 'object'
      ? flattenToArray(value, callback, concatKeys(key, parentKey))
      : callback([key, value], parentKey),
  );
};

export const flatten = (nestedObject, withValueAsKey = false) =>
  flattenToArray(
    nestedObject,
    withValueAsKey ? ([_, value]) => ({ key: value, value }) : ([key, value]) => ({ key, value }),
  ).reduce(addToMap, {});

function isObject(item) {
  return !!(item && typeof item === 'object' && !Array.isArray(item));
}

function deepMerge(objectA = {}, objectB = {}) {
  return Object.entries(objectB).reduce((acc, [key, item]) => {
    if (isObject(item)) {
      return {
        ...acc,
        [key]: deepMerge(acc[key], item),
      };
    } else {
      return {
        ...acc,
        [key]: item,
      };
    }
  }, objectA);
}

const objectUtils = {
  concatKeys,
  flatten,
  flattenToArray,
  addToMap,
  isObject,
  deepMerge,
};
export default objectUtils;
