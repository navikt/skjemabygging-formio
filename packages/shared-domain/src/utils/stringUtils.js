const charMap = {
  æ: "ae",
  Æ: "Ae",
  ø: "o",
  Ø: "O",
  å: "a",
  Å: "A",
};

const norwegianCharactersrRegexp = new RegExp(`[${Object.keys(charMap).join("")}]`, "g");

export const camelCase = (str) => {
  return str
    .toLowerCase()
    .replace(norwegianCharactersrRegexp, (match) => charMap[match])
    .replace(/[^a-z0-9]/g, " ")
    .replace(/\s(.)/g, (s) => s.toUpperCase())
    .replace(/\s/g, "")
    .replace(/^(.)/, (s) => s.toLowerCase());
};

// Change first char to upper case
export const toPascalCase = (originalText) => {
  return originalText.charAt(0).toUpperCase() + originalText.slice(1);
};

export const addPrefixOrPostfix = (originalText, prefix = "", postfix = "") => {
  if (!!prefix) {
    return `${prefix}${toPascalCase(originalText)}${postfix}`;
  } else {
    return `${originalText}${postfix}`;
  }
};

const stringUtils = {
  camelCase,
  toPascalCase,
  addPrefixOrPostfix,
};
export default stringUtils;
