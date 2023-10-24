import Pusher from 'pusher-js';

export const createPusher = (config) => {
  const { pusherKey, pusherCluster } = config;
  if (pusherKey && pusherCluster) {
    return new Pusher(pusherKey, {
      cluster: pusherCluster,
    });
  }
  return { subscribe: () => ({ bind: () => {}, unbind: () => {} }), unsubscribe: () => {}, disconnect: () => {} };
};
