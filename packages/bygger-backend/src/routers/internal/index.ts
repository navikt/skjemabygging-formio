import express, { Request, Response } from 'express';

const internalRouter = express.Router();

internalRouter.get('/isAlive', (req: Request, res: Response) => res.send('Alive'));
internalRouter.get('/isReady', (req: Request, res: Response) => res.send('Ready'));

export default internalRouter;
