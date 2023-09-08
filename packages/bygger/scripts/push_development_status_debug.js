import Pusher from "pusher";
import fs from "fs";

function pusherAppValue(name) {
  return process.env[`PUSHER_APP_${name.toUpperCase()}`];
}

const pusherApp = {
  appId: pusherAppValue("id"),
  key: pusherAppValue("key"),
  secret: pusherAppValue("secret"),
  cluster: pusherAppValue("cluster"),
};

const pusher = new Pusher({
  ...pusherApp,
  useTLS: true,
});

const jsonString = fs.readFileSync(0, "utf-8");
const message = JSON.parse(jsonString);

pusher.trigger("deployment", "status", message);
