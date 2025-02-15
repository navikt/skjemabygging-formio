import express from 'express';
import config from '../../../config';
import { copyService } from '../../../services';

const importRouter = express.Router();

importRouter.get('/source-forms', async (req, res, next) => {
  try {
    if (config.naisClusterName === 'prod-gcp' || !copyService) {
      return res.sendStatus(405);
    }
    res.json(await copyService.getSourceForms());
  } catch (err) {
    next(err);
  }
});

importRouter.put('/forms/:formPath', async (req, res, next) => {
  try {
    if (config.naisClusterName === 'prod-gcp' || !copyService) {
      return res.sendStatus(405);
    }
    const { formPath } = req.params;
    const accessToken = req.headers.AzureAccessToken as string;
    const userName = req.getUser?.().name;
    res.json(await copyService.form(formPath, accessToken, userName));
  } catch (err) {
    next(err);
  }
});

importRouter.put('/global-translations', async (req, res, next) => {
  try {
    if (config.naisClusterName === 'prod-gcp' || !copyService) {
      return res.sendStatus(405);
    }
    const accessToken = req.headers.AzureAccessToken as string;
    await copyService.globalTranslations(accessToken);
    return res.sendStatus(201);
  } catch (err) {
    next(err);
  }
});

export default importRouter;
