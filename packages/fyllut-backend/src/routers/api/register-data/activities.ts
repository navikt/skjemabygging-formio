import { Request, Response } from 'express';
import { getTokenxAccessToken } from '../../../security/tokenHelper';
import { registerDataService } from '../../../services';

const activities = {
  get: async (req: Request, res: Response) => {
    const activities = await registerDataService.getActivities({
      accessToken: getTokenxAccessToken(req),
      query: req.query as Record<string, string | string[] | undefined>,
    });

    res.json(activities);
  },
};

export default activities;
