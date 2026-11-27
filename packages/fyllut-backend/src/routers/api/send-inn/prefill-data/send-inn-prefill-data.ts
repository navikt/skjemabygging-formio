import { requestUtil } from '@navikt/skjemadigitalisering-shared-backend';
import { NextFunction, Request, Response } from 'express';
import { getIdportenPid, getTokenxAccessToken } from '../../../../security/tokenHelper';
import { prefillService } from '../../../../services';

const sendInnPrefillData = {
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accessToken = getTokenxAccessToken(req);
      const nationalIdentityNumber = getIdportenPid(req);
      const properties = requestUtil.getStringQuery(req, 'properties', true);
      const data = await prefillService.getPrefillData({ accessToken, properties, nationalIdentityNumber });
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
};

export default sendInnPrefillData;
