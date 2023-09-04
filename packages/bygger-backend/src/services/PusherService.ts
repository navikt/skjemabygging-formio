import Pusher, { Options } from "pusher";
import config from "../config";
import { logger } from "../logging/logger";

const getPusherConfig = () => {
  const pusherConfig = { ...config.pusher };
  if (pusherConfig.key && pusherConfig.app && pusherConfig.cluster && pusherConfig.secret) {
    return pusherConfig;
  }
  return undefined;
};

export interface PusherEvent {
  type: string;
  title: string;
  message: string;
}

class PusherService {
  private readonly pusher;

  constructor() {
    const pusherConfig = getPusherConfig();
    if (pusherConfig) {
      const pusherOptions: Options = {
        appId: pusherConfig.app,
        key: pusherConfig.key,
        secret: pusherConfig.secret,
        cluster: pusherConfig.cluster,
        useTLS: true,
      };

      this.pusher = new Pusher(pusherOptions);
    } else if (config.isProduction) {
      logger.warn("Pusher service not configured");
    }
  }

  trigger(pusherEvent: PusherEvent) {
    return this.pusher?.trigger("fyllut-deployment", pusherEvent.type, {
      title: pusherEvent.title,
      message: pusherEvent.message,
    });
  }
}

export default PusherService;
