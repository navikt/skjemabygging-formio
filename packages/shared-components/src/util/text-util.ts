// Change first char to upper case
const toPascalCase = (originalText: string): string => {
  return originalText.charAt(0).toUpperCase() + originalText.slice(1);
}

const addPrefixOrPostfix = (originalText: string, prefix: string = "", postfix: string = ""): string => {
  if (!!prefix) {
    return `${prefix}${toPascalCase(originalText)}${postfix}`;
  } else {
    return `${originalText}${postfix}`;
  }
}

export {
  toPascalCase,
  addPrefixOrPostfix,
}