const capitalize = (str) => str[0].toUpperCase() + str.slice(1);

const toFeatureToggles = (commaSeparatedFeatureNames) => {
  const featureToggles = {};
  if (commaSeparatedFeatureNames) {
    const featureNames = commaSeparatedFeatureNames.split(",");
    featureNames.forEach((featureName) => {
      featureToggles[`enable${capitalize(featureName.trim())}`] = true;
    });
  }
  return featureToggles;
};

const util = {
  toFeatureToggles,
};

export default util;
