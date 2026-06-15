import { HttpResponseError } from '@navikt/skjemadigitalisering-shared-backend';
import { ResponseError, SendInnAktivitet } from '@navikt/skjemadigitalisering-shared-domain';
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
      res.json(activities as SendInnAktivitet[]);
    } catch (error) {
      if (error instanceof HttpResponseError) {
        return next(
          new ResponseError(
            error.errorCode,
            'Feil ved kall til SendInn for aktiviteter',
            error.correlationId,
            'Feil ved kall til SendInn for aktiviteter',
          ),
        );
      }
      next(error);
    }
  },
};

export default sendInnActivities;
