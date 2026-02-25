// noinspection JSNonASCIINames
const charMap = {
  æ: 'ae',
  Æ: 'Ae',
  ø: 'o',
  Ø: 'O',
  å: 'a',
  Å: 'A',
};

const norwegianCharactersrRegexp = new RegExp(`[${Object.keys(charMap).join('')}]`, 'g');

const camelCase = (str) => {
  return str
    .toLowerCase()
    .replace(norwegianCharactersrRegexp, (match) => charMap[match])
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s(.)/g, (s) => s.toUpperCase())
    .replace(/\s/g, '')
    .replace(/^(.)/, (s) => s.toLowerCase());
};

// Change first char to upper case
const toPascalCase = (originalText) => {
  return originalText.charAt(0).toUpperCase() + originalText.slice(1);
};

const addPrefixOrPostfix = (originalText, prefix = '', postfix = '') => {
  if (prefix) {
    return `${prefix}${toPascalCase(originalText)}${postfix}`;
  } else {
    return `${originalText}${postfix}`;
  }
};

const truncate = (text, boundary) => {
  return text.length > boundary ? `${text.slice(0, boundary - 1)}...` : text;
};

const capitalize = (str) => str[0].toUpperCase() + str.slice(1);

const stringUtils = {
  camelCase,
  toPascalCase,
  addPrefixOrPostfix,
  truncate,
  capitalize,
};
export { stringUtils };
