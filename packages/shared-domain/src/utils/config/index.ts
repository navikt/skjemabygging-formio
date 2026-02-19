const loadJsonFromEnv = (envName: string, defaultValue = {}, processEnv = process.env) => {
  try {
    const value = processEnv[envName];
    return value ? JSON.parse(value) : defaultValue;
  } catch (error) {
    console.warn(`Failed trying to load json from env '${envName}'`, error);
  }
  return defaultValue;
};

const configUtils = {
  loadJsonFromEnv,
};

export default configUtils;
