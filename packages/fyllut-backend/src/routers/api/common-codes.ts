import { Request, Response } from 'express';
import { commonCodesService } from '../../services';

const getAccessToken = (req: Request) => req.headers.AzureAccessToken as string | undefined;
const getLanguageCode = (req: Request) => req.header('accept-language') || 'nb';

const commonCodes = {
  getArchiveSubjects: async (req: Request, res: Response) => {
    const archiveSubjects = await commonCodesService.getArchiveSubjects({
      languageCode: getLanguageCode(req),
      accessToken: getAccessToken(req),
    });

    res.send(archiveSubjects);
  },

  getCurrencies: async (req: Request, res: Response) => {
    const currencies = await commonCodesService.getCurrencies({
      accessToken: getAccessToken(req),
    });

    res.send(currencies);
  },

  getNavUnitTypes: async (req: Request, res: Response) => {
    const navUnitTypes = await commonCodesService.getNavUnitTypes({
      languageCode: getLanguageCode(req),
      accessToken: getAccessToken(req),
    });

    res.send(navUnitTypes);
  },

  getAreaCodes: async (req: Request, res: Response) => {
    const areaCodes = await commonCodesService.getAreaCodes({
      accessToken: getAccessToken(req),
    });

    res.send(areaCodes);
  },
};

export default commonCodes;
