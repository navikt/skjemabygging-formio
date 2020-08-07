import Pusher from 'pusher';

function pusherAppValue(name) {
  return process.env[`PUSHER_APP_${name.toUpperCase()}`]
}

const pusherApp = {
  appId: pusherAppValue('id'),
  key: pusherAppValue('key'),
  secret: pusherAppValue('secret')
}

const pusher = new Pusher({
  ...pusherApp,
  cluster: 'mt1',
  useTLS: true
});

pusher.trigger('my-channel', 'my-event', {
  'message': 'hello baby'
});