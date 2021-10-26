import { createBackendForTest, jsonToPromise } from "../testTools/backend/testUtils.js";
import TestUserResponse from "../testTools/backend/json/TestUserResponse.json";

import fetch from "node-fetch";
import { HttpError } from "./fetchUtils";

jest.mock("node-fetch");

describe("Backend", () => {
  const backend = createBackendForTest();
  const token = "userToken";
  const formPath = "skjema";

  beforeEach(() => {
    fetch.mockRestore();
  });
  describe("Payload encoding", () => {
    it("roundtrips successfully", async () => {
      const inputData = { number: 3, text: "flesk flesk" };
      const roundTripped = await backend.fromBase64GzipAndJson(await backend.toBase64GzipAndJson(inputData));
      expect(roundTripped).toEqual(inputData);
    });

    it("encodes the payload with gzip and b64", async () => {
      const form = { key: "value" };
      const translations = { otherKey: "otherValue" };
      const payload = await backend.payload("fileTittel", form, translations);
      expect(payload).toMatchObject({
        inputs: {
          encodedFormJson: await backend.toBase64GzipAndJson(form),
          encodedTranslationJson: await backend.toBase64GzipAndJson(translations),
        },
      });
    });
  });

  describe("publishForm", () => {

    it("publishes forms and returns ok", async () => {
      fetch
        .mockReturnValueOnce(jsonToPromise(TestUserResponse))
        .mockReturnValue(Promise.resolve({ok: true, status: 204}));

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
          encodedTranslationJson: await backend.toBase64GzipAndJson(translation),
          encodedFormJson: await backend.toBase64GzipAndJson(form),
          monorepoGitHash: "cafebabe",
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

  describe("publishResource", () => {

    it("publishes forms and returns ok", async () => {
      fetch
        .mockReturnValueOnce(jsonToPromise(TestUserResponse))
        .mockReturnValue(Promise.resolve({ok: true, status: 204}));

      const mottaksadresser = [{ _id: "123", data: {adresserlinje1: "NAV Pensjon", adresselinje2: "Postboks 123", postnummer: "1234", poststed: "Oslo"} }];
      await backend.publishResource(token, "mottaksadresser", mottaksadresser);
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
          resourceName: "mottaksadresser",
          encodedJson: await backend.toBase64GzipAndJson(mottaksadresser),
        },
      });
    });

  });

});
