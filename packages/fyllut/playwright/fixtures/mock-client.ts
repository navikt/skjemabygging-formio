const adminURL = process.env.FYLLUT_PLAYWRIGHT_MOCK_ADMIN_URL;

const restoreRouteVariants = async () => {
  if (!adminURL) throw new Error('Missing mock admin URL');
  const response = await fetch(`${adminURL}/api/mock/custom-route-variants`, {
    method: 'DELETE',
    signal: AbortSignal.timeout(10000),
  });
  if (response.status !== 204) {
    throw new Error(`Could not restore mock variants: HTTP ${response.status}`);
  }
};

export { restoreRouteVariants };
