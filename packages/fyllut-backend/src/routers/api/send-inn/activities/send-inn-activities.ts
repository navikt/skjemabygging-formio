import { NextFunction, Request, Response } from 'express';
import { getTokenxAccessToken } from '../../../../security/tokenHelper';
import { activeTaskService } from '../../../../services';

const sendInnActivities = {
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = getTokenxAccessToken(req);
      const innsendingsId = req.headers['x-innsendingsid'] as string | undefined;
      const dagligreise = req.query.dagligreise === 'true';
      const activities = await activeTaskService.getActivities({ accessToken, innsendingsId, dagligreise });
      res.json(activities);
    } catch (error) {
      next(error);
    }
  },
};

export default sendInnActivities;
