const getLanguageCodeAsIso639_1 = (locale) => {
  switch (locale) {
    case "nn-NO":
      return "nn";
    case "nb-NO":
      return "nb";
    default:
      return locale;
  }
};

const zipCountryNames = (keyNames, valueNames, mapToValue = (value) => value) => {
  keyNames.sort((first, second) => first.value.localeCompare(second.value, "nb"));
  valueNames.sort((first, second) => first.value.localeCompare(second.value, "nb"));
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
