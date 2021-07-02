import express from "express";
import { Backend } from "./backend/index.js";
import { dispatcherWithBackend } from "./backend/webApp.js";
import { buildDirectory, buildDirectoryIndexHtml } from "./context.js";

const app = express();
const projectURL = process.env.REACT_APP_FORMIO_PROJECT_URL || "https://protected-island-44773.herokuapp.com";

const publiseringWorkflowDispatchConfig = {
  workflowDispatchRef: process.env.PUBLISERING_WORKFLOW_DISPATCH_REF,
  workflowDispatchToken: process.env.akg_pat,
  workflowDispatchURL: process.env.PUBLISERING_WORKFLOW_DISPATCH_URL,
};

function gitVersion() {
  const GIT_SHA = process.env.GIT_SHA;
  if (process.env.NODE_ENV === "development") {
    if (!GIT_SHA) {
      return "dø-detta-er-development-vet-ikke-hva-versionen-er";
    }
    return GIT_SHA;
  } else {
    if (!GIT_SHA) {
      throw new Error("missing GIT_SHA");
    }
    return GIT_SHA;
  }
}

console.log("gitVersion", gitVersion());

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.get("/isAlive", (req, res) => res.send("Alive"));
app.get("/isReady", (req, res) => res.send("Ready"));
app.use("/api", dispatcherWithBackend(new Backend(projectURL, publiseringWorkflowDispatchConfig, gitVersion())));

const nodeEnv = process.env.NODE_ENV;
if (nodeEnv === "production") {
  // serve built app in production (served by weback dev server in development)
  app.use(express.static(buildDirectory));
  app.get("/*", (req, res) => {
    res.sendFile(buildDirectoryIndexHtml);
  });
}

const port = parseInt(process.env.PORT || "8080");
console.log("serving on ", port, nodeEnv);
app.listen(port);
