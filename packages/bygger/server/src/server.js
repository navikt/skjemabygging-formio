import express from "express";
import config from "./config";
import { buildDirectory, buildDirectoryIndexHtml } from "./context.js";
import authHandler from "./middleware/authHandler";
import { fsAccessRateLimiter } from "./middleware/ratelimit";
import apiRouter from "./routers/api";
import internalRouter from "./routers/internal";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use("/internal", internalRouter);
app.use("/api", authHandler, apiRouter);

if (config.isDevelopment) {
  // simulate logout on local machine
  const HOST_REGEX = /(http:\/\/localhost:\d.*\/).*/;
  app.get("/oauth2/logout", (req, res) => {
    res.header({
      "Access-Control-Expose-Headers": "Location",
      Location: HOST_REGEX.exec(req.get("referer"))[1],
    });
    res.sendStatus(307);
  });
}

if (config.isProduction) {
  // serve built app in production (served by webpack dev server in development)
  app.use(express.static(buildDirectory));
  app.get("/*", fsAccessRateLimiter, (req, res) => {
    res.sendFile(buildDirectoryIndexHtml);
  });
}

const { port, nodeEnv } = config;
console.log(`serving on ${port} (${nodeEnv})`);
app.listen(port);
