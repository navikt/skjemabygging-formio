import { stringUtils } from '../string';

export type FeatureTogglesMap = {
  [key: string]: boolean;
};

const splitCommaSeparated = (commaSeparated: string | undefined | null): string[] => {
  if (!commaSeparated) return [];
  return commaSeparated
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
};

const toFeatureToggles = (commaSeparatedFeatureNames: string | undefined | null): FeatureTogglesMap => {
  const featureToggles: FeatureTogglesMap = {};
  if (commaSeparatedFeatureNames) {
    const features = splitCommaSeparated(commaSeparatedFeatureNames);
    features.forEach((feature) => {
      const splits = feature.split('=');
      const featureName = splits[0].trim();
      const enabled = splits.length === 1 || splits[1].trim() === 'true';
      featureToggles[`enable${stringUtils.capitalize(featureName)}`] = enabled;
    });
  }
  return featureToggles;
};

const featureUtils = {
  toFeatureToggles,
  splitCommaSeparated,
};

export { featureUtils };
