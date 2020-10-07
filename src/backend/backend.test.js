import { createBackendForTest, jsonToPromise } from "../testTools/backend/testUtils.js";
import ListResponse from "../testTools/backend/json/GHListResponse.json";
import PublishResponse from "../testTools/backend/json/GHPublishResponse.json";
import TestUserResponse from "../testTools/backend/json/TestUserResponse.json";
import TokenResponse from "../testTools/backend/json/TokenResponse.json";
import fetch from "node-fetch";
import * as publishingService from "./publishingService";
import {PublishingService} from "./publishingService";

jest.mock("node-fetch");

describe("Backend", () => {
  const backend = createBackendForTest();
  const token = "userToken";
  const formPath = "skjema";

  beforeEach(() => {
    fetch.mockReset();
  });

  it("publishes forms and returns ok", async () => {
    fetch
      .mockReturnValueOnce(jsonToPromise(TestUserResponse))
      .mockReturnValueOnce(jsonToPromise(TokenResponse))
      .mockReturnValueOnce(jsonToPromise(ListResponse))
      .mockReturnValueOnce(jsonToPromise(PublishResponse));

    const result = await backend.publishForm(token, {}, formPath);
    expect(fetch).toHaveBeenCalledTimes(4);
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
    expect(calls[2]).toEqual([
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
    expect(calls[3]).toEqual([
      `${backend.getGitURL()}repos/navikt/skjemapublisering-test/contents/skjema/${formPath}.json?ref=krakra`,

      expect.objectContaining({
        method: "put",
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
    fetch.mockResolvedValueOnce({ status: 401, message: "Unauthorized" });

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
      .mockResolvedValueOnce({ status: 401, message: "Unauthorized" });

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

  it("finds SHA from list of forms and tries to publish an update", async () => {
    let spyUpdateFunction = jest.spyOn(PublishingService.prototype, "publishUpdateToForm");
    let spyCreateFunction = jest.spyOn(PublishingService.prototype, "publishNewForm");
    fetch
      .mockReturnValueOnce(jsonToPromise(TestUserResponse))
      .mockReturnValueOnce(jsonToPromise(TokenResponse))
      .mockReturnValueOnce(jsonToPromise(ListResponse));

    await backend.publishForm(token, {}, formPath);

    expect(spyUpdateFunction).toHaveBeenCalledTimes(1);
    expect(spyCreateFunction).toHaveBeenCalledTimes(0);

    spyUpdateFunction.mockReset();
    spyCreateFunction.mockReset();
  });

  it("finds no matching SHA and tries to publish new form", async () => {
    let spyUpdateFunction = jest.spyOn(PublishingService.prototype, "publishUpdateToForm");
    let spyCreateFunction = jest.spyOn(PublishingService.prototype, "publishNewForm");
    fetch
      .mockReturnValueOnce(jsonToPromise(TestUserResponse))
      .mockReturnValueOnce(jsonToPromise(TokenResponse))
      .mockReturnValueOnce(jsonToPromise(ListResponse));

    await backend.publishForm("token", {}, "skjemaSomIkkeFinnesFraFor");

    expect(spyUpdateFunction).toHaveBeenCalledTimes(0);
    expect(spyCreateFunction).toHaveBeenCalledTimes(1);

    spyCreateFunction.mockReset();
    spyUpdateFunction.mockReset();
  });
});
