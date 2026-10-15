import { baseUrl, fail } from './common.mjs';

const createFormsApiClient = (token) => {
  const request = async (path, options = {}, { allowedStatuses = [], unauthorizedMessage } = {}) => {
    const url = `${baseUrl}${path}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
    if (response.status === 401) {
      fail(
        unauthorizedMessage ??
          "Forms API returned 401. Refresh the token with 'pnpm get-tokens forms-api', then retry.",
      );
    }
    if (!response.ok && !allowedStatuses.includes(response.status)) {
      fail(`${options.method ?? 'GET'} ${url} returned ${response.status}`);
    }
    if (!response.ok) {
      return { status: response.status };
    }

    const text = await response.text();
    if (!text) {
      return { status: response.status };
    }
    try {
      return { status: response.status, body: JSON.parse(text) };
    } catch {
      return { status: response.status, body: text };
    }
  };

  return { request };
};

export { createFormsApiClient };
