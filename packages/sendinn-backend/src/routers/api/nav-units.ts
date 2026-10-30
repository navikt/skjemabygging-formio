import { Response } from 'express';
import { navUnitService } from '../../services';

const getNavUnits = async (_req: unknown, res: Response) => {
  res.setHeader('Cache-Control', 'no-store');
  res.json(await navUnitService.getNavUnits());
};

export { getNavUnits };
