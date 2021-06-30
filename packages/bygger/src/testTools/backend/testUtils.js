import { Backend } from "../../backend";

const { Response } = jest.requireActual("node-fetch");

export const createBackendForTest = () => {
  const projectURL = "https://projectApi.example.com";
  return new Backend(
    projectURL,
    {
      workflowDispatchURL: "https://api.github.com/navikt/repo/workflow_dispatch",
    },
    "cafebabe"
  );
};

export const jsonToPromise = (json) => Promise.resolve(new Response(JSON.stringify(json)));
