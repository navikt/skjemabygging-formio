const capitalize = (str: string) => str[0].toUpperCase() + str.slice(1);

export type FeatureTogglesMap = {
  [key: string]: boolean;
};

const toFeatureToggles = (commaSeparatedFeatureNames: string | undefined | null): FeatureTogglesMap => {
  const featureToggles: FeatureTogglesMap = {};
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
