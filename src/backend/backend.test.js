import {createBackendForTest, jsonToPromise} from "../testTools/backend/testUtils.js";
import ListResponse from "../testTools/backend/json/GHListResponse.json";
import PublishResponse from "../testTools/backend/json/GHPublishResponse.json";
import TestUserResponse from "../testTools/backend/json/TestUserResponse.json";
import TokenResponse from "../testTools/backend/json/TokenResponse.json";
import GetRefResponse from "../testTools/backend/json/GHGetRefResponse.json";
import PackageJsonResponse from "../testTools/backend/json/GHPackageJsonResponse.json";
import UpdatePackageJsonResponse from "../testTools/backend/json/GHUpdatePackageJsonResponse.json"
import GetTempRefResponse from "../testTools/backend/json/GHGetTempRefResponse.json";
import PatchRefResponse from "../testTools/backend/json/GHPatchRefResponse.json";

import fetch from "node-fetch";
import {PublishingService} from "./publishingService";

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
      .mockReturnValueOnce(jsonToPromise(TokenResponse))
      .mockReturnValueOnce(jsonToPromise(GetRefResponse))
      .mockReturnValueOnce(jsonToPromise(CreateRefResponse))
      .mockReturnValueOnce(jsonToPromise(ListResponse))
      .mockReturnValueOnce(jsonToPromise(PublishResponse))
      .mockReturnValueOnce(jsonToPromise(PackageJsonResponse))
      .mockReturnValueOnce(jsonToPromise(UpdatePackageJsonResponse))
      .mockReturnValueOnce(jsonToPromise(GetTempRefResponse))
      .mockReturnValueOnce(jsonToPromise(PatchRefResponse))
      .mockReturnValueOnce(Promise.resolve(new Response(null, {status: 204})));

    const result = await backend.publishForm(token, {}, formPath);
    expect(fetch).toHaveBeenCalledTimes(11);
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
    expect(calls[1]).toEqual([
      `${backend.getGitURL()}app/installations/${backend.githubAppConfig.installationID}/access_tokens`,
      expect.objectContaining({
        method: "post",
        headers: {
          Authorization: expect.any(String),
          "Content-Type": "application/json",
          Accept: "application/vnd.github.machine-man-preview+json",
        },
      }),
    ]);
    expect(calls[2]).toEqual(
      ["https://api.example.com/repos/navikt/skjemapublisering-test/git/refs/heads/krakra",
        {headers: {Accept: "application/vnd.github.v3+json"}}],
    )
    expect(calls[3]).toEqual(
      ["https://api.example.com/repos/navikt/skjemapublisering-test/git/refs",
        {
          body: expect.any(String),
          method: 'POST',
          headers: {
            Authorization: "token " + TokenResponse.token,
            "Content-Type": "application/json",
            Accept: "application/vnd.github.machine-man-preview+json",
          }
        }],
    )
    expect(calls[4]).toEqual([
      `${backend.getGitURL()}repos/navikt/skjemapublisering-test/contents/skjema?ref=krakra`,
      {
        method: "get",
        headers: {
          Authorization: "token " + TokenResponse.token,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.machine-man-preview+json",
        },
      },
    ]);
    expect(calls[5]).toEqual([
      `${backend.getGitURL()}repos/navikt/skjemapublisering-test/contents/skjema/${formPath}.json`,

      expect.objectContaining({
        method: "PUT",
        body: expect.any(String),
        headers: {
          Authorization: "token " + TokenResponse.token,
          "Content-Type": "application/json",
          Accept: "application/vnd.github.machine-man-preview+json",
        },
      }),
    ]);
    expect(result.status).toBe("OK");
  });

  it("does not try to fetch more if authorization check to server fails", async () => {
    fetch.mockRejectedValue(new Error("Connection refused"));

    const result = await backend.publishForm(token, {}, formPath);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result.status).toBe("FAILED");
  });

  it("does not try to fetch more if authorization check to server returns unauthorized", async () => {
    fetch.mockResolvedValueOnce({status: 401, message: "Unauthorized"});

    const result = await backend.publishForm(token, {}, formPath);
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(result.status).toBe("UNAUTHORIZED");
  });

  it("does not try to fetch more if authorization check to github fails", async () => {
    fetch.mockReturnValueOnce(jsonToPromise(TestUserResponse)).mockRejectedValue(new Error("Connection refused"));

    const result = await backend.publishForm(token, {}, formPath);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result.status).toBe("FAILED");
  });

  it("does not try to fetch more if authorization check to github returns unauthorized", async () => {
    fetch
      .mockReturnValueOnce(jsonToPromise(TestUserResponse))
      .mockResolvedValueOnce({status: 401, message: "Unauthorized"});

    const result = await backend.publishForm(token, {}, formPath);
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(result.status).toBe("FAILED");
  });

  it("does not try to publish if getting repository content failed", async () => {
    fetch
      .mockReturnValueOnce(jsonToPromise(TestUserResponse))
      .mockReturnValueOnce(jsonToPromise(TokenResponse))
      .mockRejectedValue(new Error("Connection refused"));

    const result = await backend.publishForm(token, {}, formPath);
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(result.status).toBe("FAILED");
  });

  describe('publish update or create', () => {
    let spyUpdateFunction;
    let spyCreateFunction;
    beforeEach(() => {
      spyUpdateFunction = jest.spyOn(PublishingService.prototype, "publishUpdateToForm");
      spyCreateFunction = jest.spyOn(PublishingService.prototype, "publishNewForm");
      fetch
        .mockReturnValueOnce(jsonToPromise(TestUserResponse))
        .mockReturnValueOnce(jsonToPromise(TokenResponse))
        .mockReturnValueOnce(jsonToPromise(GetRefResponse))
        .mockReturnValueOnce(jsonToPromise(CreateRefResponse))
        .mockReturnValueOnce(jsonToPromise(ListResponse))
        .mockReturnValueOnce(jsonToPromise(PublishResponse))
        .mockReturnValueOnce(jsonToPromise(PackageJsonResponse))
        .mockReturnValueOnce(jsonToPromise(UpdatePackageJsonResponse))
        .mockReturnValueOnce(jsonToPromise(GetTempRefResponse))
        .mockReturnValueOnce(jsonToPromise(PatchRefResponse))
        .mockReturnValueOnce(Promise.resolve(new Response(null, {status: 204})));
    });
    afterEach(() => {
      spyCreateFunction.mockRestore();
      spyUpdateFunction.mockRestore();
    });
    it("finds SHA from list of forms and tries to publish an update", async () => {
      await backend.publishForm(token, {}, formPath);
      expect(spyUpdateFunction).toHaveBeenCalledTimes(1);
      expect(spyCreateFunction).toHaveBeenCalledTimes(0);
    });

    it("finds no matching SHA and tries to publish new form", async () => {
      await backend.publishForm("token", {}, "skjemaSomIkkeFinnesFraFor");
      expect(spyUpdateFunction).toHaveBeenCalledTimes(0);
      expect(spyCreateFunction).toHaveBeenCalledTimes(1);
    });
  });
});
