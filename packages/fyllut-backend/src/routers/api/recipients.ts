import { Request, Response } from 'express';
import { recipientService } from '../../services';

const recipients = {
  get: async (_req: Request, res: Response) => {
    const result = await recipientService.getRecipients();
    res.json(result);
  },
};

export default recipients;
