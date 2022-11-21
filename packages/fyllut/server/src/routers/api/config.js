import { config as configObject } from "../../config/config";

const { sentryDsn, naisClusterName, featureToggles, isDelingslenke, isDevelopment } = configObject;

const config = {
  get: async (req, res) => {
    return res.json({
      NAIS_CLUSTER_NAME: naisClusterName,
      REACT_APP_SENTRY_DSN: sentryDsn,
      FEATURE_TOGGLES: featureToggles,
      isDelingslenke,
      isDevelopment,
    });
  },
};

export default config;
