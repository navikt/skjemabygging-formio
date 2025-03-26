import { Request, Response } from 'express';

const dummyData = [
  { label: 'Activity 1', value: 'activity1' },
  { label: 'Activity 2', value: 'activity2' },
  { label: 'Activity 3', value: 'activity3' },
];

const activities = {
  get: async (_req: Request, res: Response) => {
    return res.json(dummyData);
  },
};

export default activities;
