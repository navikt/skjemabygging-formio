const NaisCluster = {
  DEV: 'dev-gcp',
  LABS: 'labs-gcp',
  PROD: 'prod-gcp',
} as const;

const isProdGcp = (clusterName?: string) => clusterName === NaisCluster.PROD;

/**
 * Synthetic identity numbers only exist outside production, where the forms themselves accept them,
 * so every app reading a submitted identity number has to allow them in the same environments.
 * Defaults to the cluster the process runs in.
 */
const allowSyntheticIdentityNumbers = (clusterName: string | undefined = process.env.NAIS_CLUSTER_NAME) =>
  !isProdGcp(clusterName);

const naisClusterUtil = {
  allowSyntheticIdentityNumbers,
  isProdGcp,
};

export { NaisCluster, naisClusterUtil };
