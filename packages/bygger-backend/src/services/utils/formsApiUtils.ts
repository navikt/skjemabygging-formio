import correlator from 'express-correlation-id';
import { v4 as uuid } from 'uuid';

const createHeaders = (accessToken?: string, revisionId?: number, skipContentType?: boolean) => {
  return {
    ...(!skipContentType && { 'Content-Type': 'application/json' }),
    'x-correlation-id': correlator.getId() ?? uuid(),
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
    ...(revisionId && { 'Formsapi-Entity-Revision': `${revisionId}` }),
  };
};

export { createHeaders };
