const KEYS_TO_CLEAR = /^(Authorization|.*token.*|cookie|x-client.+)$/i;

const recursivelyClean = (maybeObject) => {
  if (maybeObject instanceof Object) {
    Object.keys(maybeObject).forEach((key) => {
      if (KEYS_TO_CLEAR.test(key)) {
        maybeObject[key] = '<removed>';
      } else {
        recursivelyClean(maybeObject[key]);
      }
    });
  }
};

const clean = (json) => {
  const clone = JSON.parse(JSON.stringify(json));
  recursivelyClean(clone);
  return clone;
};

export { clean };
