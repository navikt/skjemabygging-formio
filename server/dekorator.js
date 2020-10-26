import jsdom from "jsdom";
import NodeCache from "node-cache";
import fetch from "node-fetch";
import { logger } from "./logger.js";

const { JSDOM } = jsdom;

const SECONDS_PER_MINUTE = 60;
const SECONDS_PER_HOUR = SECONDS_PER_MINUTE * 60;

// Refresh cache every hour
const cache = new NodeCache({
  stdTTL: SECONDS_PER_HOUR,
  checkperiod: SECONDS_PER_MINUTE,
});

const getDecorator = async () =>
  new Promise(async (resolve, reject) => {
    const decorator = cache.get("main-cache");
    if (decorator) {
      resolve(decorator);
    } else {
      try {
        const res = await fetch(process.env.DECORATOR_URL);
        if (res.ok) {
          const body = await res.text();
          const { document } = new JSDOM(body).window;
          const prop = "innerHTML";
          const data = {
            HEADER: document.getElementById("header-withmenu")[prop],
            STYLES: document.getElementById("styles")[prop],
            FOOTER: document.getElementById("footer-withmenu")[prop],
            SCRIPTS: document.getElementById("scripts")[prop],
          };
          cache.set("main-cache", data);
          logger.info(`Creating cache`);
          resolve(data);
        } else {
          reject(new Error(`Klarte ikke å hente dekoratør, ${res.status}`));
        }
      } catch (error) {
        reject(new Error(`Klarte ikke å hente dekoratør, ${error}`));
      }
    }
  });

export default getDecorator;
