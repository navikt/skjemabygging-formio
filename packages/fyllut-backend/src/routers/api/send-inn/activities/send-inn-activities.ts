import { requestUtil } from '@navikt/skjemadigitalisering-shared-backend';
import { NextFunction, Request, Response } from 'express';
import { getTokenxAccessToken } from '../../../../security/tokenHelper';
import { applicationActivitiesService } from '../../../../services';

const sendInnActivities = {
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = getTokenxAccessToken(req);
      const innsendingsId = requestUtil.getHeader(req, 'x-innsendingsid', true);
      const dagligreise = requestUtil.getStringQuery(req, 'dagligreise', true) === 'true';
      const activities = await applicationActivitiesService.getActivities({ accessToken, innsendingsId, dagligreise });
      res.json(activities);
    } catch (error) {
      next(error);
    }
  },
};

export default sendInnActivities;
