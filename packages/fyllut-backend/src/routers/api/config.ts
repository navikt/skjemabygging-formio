import { config as configObject } from "../../config/config";
import { ConfigType } from "@navikt/skjemadigitalisering-shared-domain";

const { naisClusterName, featureToggles, isDelingslenke, isDevelopment, amplitude } = configObject;

const config = {
  get: async (req, res): Promise<ConfigType> => {
    return res.json({
      NAIS_CLUSTER_NAME: naisClusterName,
      FEATURE_TOGGLES: featureToggles,
      isDelingslenke,
      isDevelopment,
      amplitudeApiEndpoint: amplitude.apiEndpoint,
    });
  },
};

export default config;
