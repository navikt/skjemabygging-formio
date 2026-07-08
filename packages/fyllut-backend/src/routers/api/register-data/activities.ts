import { requestUtil } from '@navikt/skjemadigitalisering-shared-backend';
import { Request, Response } from 'express';
import { getTokenxAccessToken } from '../../../security/tokenHelper';
import { registerDataService } from '../../../services';

const activities = {
  get: async (req: Request, res: Response) => {
    const activities = await registerDataService.getActivities({
      accessToken: getTokenxAccessToken(req),
      query: requestUtil.getQueryObject<Record<string, string | string[] | undefined>>(req),
    });

    res.json(activities);
  },
};

export default activities;
