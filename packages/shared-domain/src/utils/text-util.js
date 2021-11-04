// Change first char to upper case
const toPascalCase = (originalText) => {
  return originalText.charAt(0).toUpperCase() + originalText.slice(1);
};

const addPrefixOrPostfix = (originalText, prefix = "", postfix = "") => {
  if (!!prefix) {
    return `${prefix}${toPascalCase(originalText)}${postfix}`;
  } else {
    return `${originalText}${postfix}`;
  }
};

export { toPascalCase, addPrefixOrPostfix };
