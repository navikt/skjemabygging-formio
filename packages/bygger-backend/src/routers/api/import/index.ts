import express from 'express';
import { copyService } from '../../../services';

const importRouter = express.Router();

importRouter.get('/source-forms', async (req, res, next) => {
  try {
    if (!copyService) {
      return res.sendStatus(405);
    }
    res.json(await copyService.getSourceForms());
  } catch (err) {
    next(err);
  }
});

export default importRouter;
