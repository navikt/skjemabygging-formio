const createHeaders = (accessToken?: string, revisionId?: number) => {
  return {
    'Content-Type': 'application/json',
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...(revisionId && { 'Formsapi-Entity-Revision': `${revisionId}` }),
  };
};

export { createHeaders };
