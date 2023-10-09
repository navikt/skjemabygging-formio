import { PushEvent } from '@octokit/webhooks-types';
import { NextFunction, Request, Response } from 'express';
import { logger } from '../../logging/logger';
import { backendInstance, pusherService } from '../../services';
import { PusherEvent } from '../../services/PusherService';
import { toMeta } from '../../util/logUtils';
import { ApiError } from '../api/helpers/errors';

interface NotificationRequestBody {
  type: 'success' | 'failure';
  githubEventMessage: PushEvent;
}

const pusher = {
  post: async (req: Request, res: Response, next: NextFunction) => {
    const body: NotificationRequestBody = req.body;
    const logMeta = toMeta('requestBody', body);
    try {
      logger.info('Received notification', logMeta);
      const pusherEvent: PusherEvent = backendInstance.interpretGithubPushEvent(body.githubEventMessage, body.type);
      await pusherService.trigger(pusherEvent);
    } catch (error) {
      logger.warn('Failed to process notification', { ...logMeta, error });
      return next(new ApiError('Failed to process notification', true, error as Error));
    }
    return res.sendStatus(200);
  },
};

export default pusher;
