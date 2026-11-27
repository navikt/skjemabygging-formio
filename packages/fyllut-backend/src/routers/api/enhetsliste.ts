import { Request, Response } from 'express';
import { navUnitService } from '../../services';

const enhetsliste = {
  get: async (_req: Request, res: Response) => {
    return res.json(await navUnitService.getSupportedNavUnits());
  },
};

export default enhetsliste;
