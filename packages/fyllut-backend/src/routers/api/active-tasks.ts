import { Request, Response } from 'express';
import { config } from '../../config/config';
import { getTokenxAccessToken } from '../../security/tokenHelper';

type Soknad = {
  skjemanr: string;
  innsendingsId: string;
  endretDato: string;
  soknadstype: 'soknad' | 'ettersendelse';
};

const { sendInnConfig } = config;

const activeTasks = {
  get: async (req: Request, res: Response) => {
    const tokenxAccessToken = getTokenxAccessToken(req);
    const response = await fetch(
      `${sendInnConfig.host}${sendInnConfig.paths.opprettedeSoknaderForSkjema(req.params.skjemanummer)}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${tokenxAccessToken}`,
        },
      },
    );

    const responseJson: Soknad[] = await response.json();
    res.json(
      responseJson.map(({ skjemanr, innsendingsId, endretDato, soknadstype }: Soknad) => ({
        skjemanr,
        innsendingsId,
        endretDato,
        soknadstype,
      })),
    );
  },
};

export default activeTasks;
