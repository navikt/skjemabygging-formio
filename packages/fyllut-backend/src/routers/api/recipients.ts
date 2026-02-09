import { correlator } from '@navikt/skjemadigitalisering-shared-backend';
import { Request, Response } from 'express';
import fetch from 'node-fetch';
import { config } from '../../config/config';
import { responseToError } from '../../utils/errorHandling';

const recipients = {
  get: async (_req: Request, res: Response) => {
    const response = await fetch(`${config.formsApiUrl}/v1/recipients`, {
      method: 'GET',
      headers: {
        'x-correlation-id': correlator.getId() as string,
      },
    });
    if (response.ok) {
      return res.json(await response.json());
    }
    throw await responseToError(response, 'Failed to fetch recipients');
  },
};

export default recipients;
