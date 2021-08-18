const charMap = {
  "æ": "ae",
  "Æ": "Ae",
  "ø": "o",
  "Ø": "O",
  "å": "a",
  "Å": "A",
}

const norwegianCharactersrRegexp= new RegExp(`[${Object.keys(charMap).join('')}]`, 'g')

export const camelCase = str => {
  return str.toLowerCase()
    .replace(norwegianCharactersrRegexp, match => charMap[match])
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s(.)/g, s => s.toUpperCase())
    .replace(/\s/g, '')
    .replace(/^(.)/, s => s.toLowerCase());
};

export default {
  camelCase,
};
