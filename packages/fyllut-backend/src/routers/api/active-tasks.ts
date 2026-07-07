import { requestUtil } from '@navikt/skjemadigitalisering-shared-backend';
import { NextFunction, Request, Response } from 'express';
import { getTokenxAccessToken } from '../../security/tokenHelper';
import { activeTaskService } from '../../services';

const activeTasks = {
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const skjemanummer = requestUtil.getStringParam(req, 'skjemanummer')!;
      const accessToken = getTokenxAccessToken(req);
      const tasks = await activeTaskService.getActiveTasks({ accessToken, skjemanummer });
      res.json(tasks);
    } catch (error) {
      next(error);
    }
  },
};

export default activeTasks;
