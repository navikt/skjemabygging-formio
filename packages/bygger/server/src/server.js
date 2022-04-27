import express from "express";
import { Backend } from "./Backend";
import config from "./config";
import { buildDirectory, buildDirectoryIndexHtml } from "./context.js";
import { fsAccessRateLimiter } from "./middleware/ratelimit";
import { dispatcherWithBackend } from "./webApp.js";

const app = express();

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.get("/isAlive", (req, res) => res.send("Alive"));
app.get("/isReady", (req, res) => res.send("Ready"));
app.use("/api", dispatcherWithBackend(new Backend(config)));

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
