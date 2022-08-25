import { config as configObject } from "../../config/config";

const { sentryDsn, naisClusterName, featureToggles, isDelingslenke } = configObject;

const config = {
  get: async (req, res) => {
    return res.json({
      NAIS_CLUSTER_NAME: naisClusterName,
      REACT_APP_SENTRY_DSN: sentryDsn,
      FEATURE_TOGGLES: featureToggles,
      IS_DELINGSLENKE: isDelingslenke,
    });
  },
};

export default config;
