const capitalize = (str: string) => str[0].toUpperCase() + str.slice(1);

export type FeatureTogglesMap = {
  [key: string]: boolean;
};

const toFeatureToggles = (commaSeparatedFeatureNames: string | undefined | null): FeatureTogglesMap => {
  const featureToggles: FeatureTogglesMap = {};
  if (commaSeparatedFeatureNames) {
    const features = commaSeparatedFeatureNames.split(',');
    features.forEach((feature) => {
      const splits = feature.split('=');
      const featureName = splits[0].trim();
      const enabled = splits.length === 1 || splits[1].trim() === 'true';
      featureToggles[`enable${capitalize(featureName)}`] = enabled;
    });
  }
  return featureToggles;
};

const util = {
  toFeatureToggles,
};

export default util;
