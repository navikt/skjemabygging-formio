import { Request, Response } from 'express';
import { config } from '../../config/config';
import { getTokenxAccessToken } from '../../security/tokenHelper';

type Task = {
  skjemanr: string;
  innsendingsId: string;
  endretDato: string;
  status: 'Opprettet' | 'Utfylt';
};

const { sendInnConfig } = config;

const activeTasks = {
  get: async (req: Request, res: Response) => {
    const tokenxAccessToken = getTokenxAccessToken(req);
    const response = await fetch(`${sendInnConfig.host}${sendInnConfig.paths.aktiveOpprettedeSoknader}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${tokenxAccessToken}`,
      },
    });

    const responseJson: Task[] = await response.json();
    res.json(
      responseJson
        .filter((task) => task.skjemanr === req.params.skjemanummer)
        .map(({ skjemanr, innsendingsId, endretDato, status }: Task) => ({
          skjemanr,
          innsendingsId,
          endretDato,
          status,
        })),
    );
  },
};

export default activeTasks;
