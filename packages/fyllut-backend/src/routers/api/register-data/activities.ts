import { Request, Response } from 'express';
import { getTokenxAccessToken } from '../../../security/tokenHelper';
import { mapActivityResponse } from './utils';

const dummyData = {
  alternativ: [
    { tekst: 'Activity 1', id: 'activity1' },
    { tekst: 'Activity 2', id: 'activity2' },
    { tekst: 'Activity 3', id: 'activity3' },
  ],
};

// GET <xx>/aktiviteter?lang=NB/NN/EN -> selv om vi kun har 1 språk nu
const activities = {
  get: async (req: Request, res: Response) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const tokenXAccessToken = getTokenxAccessToken(req);
    return res.json(mapActivityResponse(dummyData));
  },
};

export default activities;
