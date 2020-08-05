import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { Backend } from "../src/backend/index.js";
import { dispatcherWithBackend } from "../src/backend/webApp.js";

// node backward compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const projectURL = process.env.REACT_APP_FORMIO_PROJECT_URL || "https://protected-island-44773.herokuapp.com";
const skjemapubliseringGHUrl = "https://api.github.com/repos/navikt/skjemapublisering-test/contents/skjema";
const GH_KEY = process.env.GITHUB_KEY;
const GH_PUBLISHING_APP_ID = process.env.GITHUB_PUBLISHING_APP_ID;
const GH_PUBLISHING_INSTALLATION_ID = process.env.GITHUB_PUBLISHING_INSTALLATION_ID;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(
  "/api",
  dispatcherWithBackend(
    new Backend(projectURL, skjemapubliseringGHUrl, GH_KEY, GH_PUBLISHING_APP_ID, GH_PUBLISHING_INSTALLATION_ID)
  )
);

const nodeEnv = process.env.NODE_ENV;
if (nodeEnv === "production") {
  // serve built app in production (served by weback dev server in development)
  app.use(express.static(path.join(__dirname, "..", "build")));
  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "build", "index.html"));
  });
}

const port = parseInt(process.env.PORT || "8080");
console.log("serving on ", port, nodeEnv);
app.listen(port);
