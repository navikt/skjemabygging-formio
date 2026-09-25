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

const useRouteVariant = async (id: string) => {
  if (!adminURL) throw new Error('Missing mock admin URL');
  const response = await fetch(`${adminURL}/api/mock/custom-route-variants`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ id }),
    signal: AbortSignal.timeout(10000),
  });
  if (response.status !== 204) {
    throw new Error(`Could not select mock variant ${id}: HTTP ${response.status}`);
  }
  const selected = await fetch(`${adminURL}/api/mock/custom-route-variants`, {
    signal: AbortSignal.timeout(10000),
  });
  if (!selected.ok) throw new Error(`Could not read mock variants: HTTP ${selected.status}`);
  const variants: unknown = await selected.json();
  if (!Array.isArray(variants) || !variants.includes(id)) {
    throw new Error(`Mock variant ${id} was not activated`);
  }
};

export { restoreRouteVariants, useRouteVariant };
