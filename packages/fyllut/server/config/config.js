import {NaisCluster} from "./nais-cluster.js"

const config = {
  sentryDsn: process.env.REACT_APP_SENTRY_DSN,
  naisClusterName: process.env.NAIS_CLUSTER_NAME,
  useFormioApi: process.env.FORMS_SOURCE === 'formioapi',
  skjemaDir: process.env.SKJEMA_DIR,
  skjemaUrl: process.env.SKJEMA_URL,
  translationDir: process.env.TRANSLATION_DIR,
  gitVersion: process.env.GIT_SHA,
}

const checkConfigConsistency = (config, logError = console.error, exit = process.exit) => {
  const {useFormioApi, naisClusterName, skjemaUrl} = config;
  if (useFormioApi) {
    if (naisClusterName === NaisCluster.PROD) {
      logError(`FormioApi is not allowed in ${naisClusterName}`)
      exit(1)
    }
    if (!skjemaUrl) {
      logError('SKJEMA_URL is required when using FormioApi')
      exit(1)
    }
  }
}

export {config, checkConfigConsistency}
