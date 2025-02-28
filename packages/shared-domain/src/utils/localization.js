const getLanguageCodeAsIso639_1 = (locale) => {
  switch (locale) {
    case 'nn':
    case 'nn-NO':
      return 'nn';
    case 'en':
      return 'en';
    case 'NO':
    case 'no':
    case 'nb':
    case 'nb-NO':
    default:
      return 'nb';
  }
};

const zipCountryNames = (keyNames, valueNames, mapToValue = (value) => value) => {
  if (keyNames.length !== valueNames.length) {
    return {};
  }
  keyNames.sort((first, second) => first.value.localeCompare(second.value, 'nb'));
  valueNames.sort((first, second) => first.value.localeCompare(second.value, 'nb'));
  return keyNames.reduce(
    (acc, { label }, index) => ({
      ...acc,
      [label]: mapToValue(valueNames[index]),
    }),
    {},
  );
};

const localizationUtils = {
  getLanguageCodeAsIso639_1,
  zipCountryNames,
};
export default localizationUtils;
