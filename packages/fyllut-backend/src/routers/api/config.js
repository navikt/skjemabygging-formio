import { config as configObject } from "../../config/config";

const { naisClusterName, featureToggles, isDelingslenke, isDevelopment } = configObject;

const config = {
  get: async (req, res) => {
    return res.json({
      NAIS_CLUSTER_NAME: naisClusterName,
      FEATURE_TOGGLES: featureToggles,
      isDelingslenke,
      isDevelopment,
    });
  },
};

export default config;