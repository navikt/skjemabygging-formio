import { createBackendForTest, jsonToPromise } from "../testTools/backend/testUtils.js";
import ListResponse from "../testTools/backend/json/GHListResponse.json";
import PublishResponse from "../testTools/backend/json/GHPublishResponse.json";
import TestUserResponse from "../testTools/backend/json/TestUserResponse.json";
import TokenResponse from "../testTools/backend/json/TokenResponse.json";
import GetRefResponse from "../testTools/backend/json/GHGetRefResponse.json";
import PackageJsonResponse from "../testTools/backend/json/GHPackageJsonResponse.json";
import UpdatePackageJsonResponse from "../testTools/backend/json/GHUpdatePackageJsonResponse.json";
import GetTempRefResponse from "../testTools/backend/json/GHGetTempRefResponse.json";
import PatchRefResponse from "../testTools/backend/json/GHPatchRefResponse.json";

import fetch from "node-fetch";
import { HttpError } from "./fetchUtils";

jest.mock("node-fetch");

describe("Backend", () => {
  const backend = createBackendForTest();
  const token = "userToken";
  const formPath = "skjema";
  const CreateRefResponse = {};

  beforeEach(() => {
    fetch.mockRestore();
  });

  it("publishes forms and returns ok", async () => {
    fetch
      .mockReturnValueOnce(jsonToPromise(TestUserResponse))
      .mockReturnValueOnce(Promise.resolve(new Response(null, { status: 204 })));

    const form = { id: "testskjema" };
    const translation = {};
    await backend.publishForm(token, form, translation, formPath);
    expect(fetch).toHaveBeenCalledTimes(2);
    const calls = fetch.mock.calls;
    expect(calls[0]).toEqual([
      `${backend.getProjectURL()}/current`,
      {
        headers: {
          "Content-Type": "application/json",
          "x-jwt-token": token,
        },
      },
    ]);
    expect.objectContaining(calls[1], {
      method: "POST",
      headers: {
        Authorization: expect.any(String),
        "Content-Type": "Application/JSON",
        Accept: "application/vnd.github.v3+json",
      },
    });
    const body = JSON.parse(calls[1][1].body);
    expect(body).toEqual({
      inputs: {
        formJsonFileTitle: formPath,
        translationJson: JSON.stringify(translation),
        formJson: JSON.stringify(form),
      },
    });
    expect(calls[1][0]).toEqual("https://api.github.com/navikt/repo/workflow_dispatch");
  });

  it("does not try to fetch more if authorization check to server fails", async () => {
    const MyError = class extends Error {};
    fetch.mockRejectedValue(new MyError("Connection refused"));
    await expect(backend.publishForm(token, {}, {}, formPath)).rejects.toThrowError(MyError);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("does not try to fetch more if authorization check to server returns unauthorized", async () => {
    fetch.mockResolvedValueOnce({ status: 401, statusText: "Unauthorized" });
    await expect(backend.publishForm(token, {}, {}, formPath)).rejects.toThrowError(HttpError);
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("does not try to fetch more if authorization check to github fails", async () => {
    const MyError = class extends Error {};
    fetch.mockReturnValueOnce(jsonToPromise(TestUserResponse)).mockRejectedValue(new MyError("Connection refused"));
    await expect(backend.publishForm(token, {}, {}, formPath)).rejects.toThrowError(MyError);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("does not try to fetch more if authorization check to github returns unauthorized", async () => {
    fetch
      .mockReturnValueOnce(jsonToPromise(TestUserResponse))
      .mockResolvedValueOnce({ status: 401, statusText: "Unauthorized", message: "Unauthorized" });
    // should handle 401 error from github  and adapt to internal server error, but this is not implemented now
    await expect(backend.publishForm(token, {}, {}, formPath)).rejects.toThrow(HttpError);
    expect(fetch).toHaveBeenCalledTimes(2);
  });
});
