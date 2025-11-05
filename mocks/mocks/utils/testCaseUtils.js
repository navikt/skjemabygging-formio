const filterKeys = (obj, excludeKeys) => {
  if (!obj || typeof obj !== 'object') return obj;
  const filtered = Array.isArray(obj) ? [...obj] : { ...obj };

  excludeKeys.forEach((keyPath) => {
    const keys = keyPath.split('.');

    const traverseAndDelete = (current, keyIndex) => {
      if (keyIndex >= keys.length) return;

      const key = keys[keyIndex];

      // If we're at the last key, delete it
      if (keyIndex === keys.length - 1) {
        if (Array.isArray(current)) {
          current.forEach((item) => {
            if (item && typeof item === 'object') {
              delete item[key];
            }
          });
        } else if (current && typeof current === 'object') {
          delete current[key];
        }
        return;
      }

      // Navigate deeper
      if (!current[key]) return;

      if (Array.isArray(current[key])) {
        // For arrays, recursively process each element
        current[key].forEach((item) => {
          traverseAndDelete(item, keyIndex + 1);
        });
      } else if (typeof current[key] === 'object') {
        traverseAndDelete(current[key], keyIndex + 1);
      }
    };

    traverseAndDelete(filtered, 0);
  });

  return filtered;
};

const findMismatches = (obj1, obj2, path = '') => {
  const mismatches = [];
  const allKeys = new Set([...Object.keys(obj1 || {}), ...Object.keys(obj2 || {})]);

  allKeys.forEach((key) => {
    const currentPath = path ? `${path}.${key}` : key;
    const val1 = obj1?.[key];
    const val2 = obj2?.[key];

    if (val1 !== null && val2 !== null && typeof val1 === 'object' && typeof val2 === 'object') {
      mismatches.push(...findMismatches(val1, val2, currentPath));
    } else if (JSON.stringify(val1) !== JSON.stringify(val2)) {
      mismatches.push({
        path: currentPath,
        expected: val2,
        actual: val1,
      });
    }
  });

  return mismatches;
};

const deepCopy = (obj) => JSON.parse(JSON.stringify(obj));

const verifyJsonBody = (actualBody, expectedBody, excludeKeys = []) => {
  const filteredActual = filterKeys(deepCopy(actualBody), excludeKeys);
  const filteredExpected = filterKeys(expectedBody, excludeKeys);

  if (JSON.stringify(filteredActual) === JSON.stringify(filteredExpected)) {
    return [];
  }

  return findMismatches(filteredActual, filteredExpected) || [];
};

export const compareBodyMiddleware = (expectedBody, excludeKeys = [], onSuccess) => {
  return async (req, res) => {
    const mismatches = verifyJsonBody(req.body, expectedBody, excludeKeys);
    if (mismatches.length) {
      console.error(
        `Unexpected request body (${JSON.stringify(req.body)}) - mismatches: ${JSON.stringify(mismatches)}`,
      );
      res.status(400);
      res.contentType('application/json; charset=UTF-8');
      res.send({
        message: 'Bad Request: Verification of request body failed',
        mismatches: mismatches,
      });
      return;
    }
    onSuccess(req, res);
  };
};
