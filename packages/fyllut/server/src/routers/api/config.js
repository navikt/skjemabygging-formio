import { config as configObject } from "../../config/config.js";

const { sentryDsn, naisClusterName, featureToggles } = configObject;

const config = {
  get: async (req, res) => {
    return res.json({
      NAIS_CLUSTER_NAME: naisClusterName,
      REACT_APP_SENTRY_DSN: sentryDsn,
      FEATURE_TOGGLES: featureToggles,
    });
  },
};

export default config;
