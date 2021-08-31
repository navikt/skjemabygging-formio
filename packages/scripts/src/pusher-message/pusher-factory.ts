import Pusher, {Options} from "pusher";

class PusherFactory {
  static createInstance(pusherConfig: Options) {
    return new Pusher({
      ...pusherConfig,
      useTLS: true,
    });
  }
}

export default PusherFactory;
