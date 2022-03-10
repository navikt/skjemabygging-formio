import { get, HttpError, MimeType } from "./http";
import nock from "nock";

describe("http requests", () => {
  describe("get", () => {
    beforeEach(() => {
      nock("http://localhost")
        .defaultReplyHeaders({
          "Content-Type": 'application/json',
        })
        .get("/ok")
        .reply(200, {});
    });

    it("with custom headers", () => {
      const headers = {
        "Content-Type": MimeType.JSON,
        Accept: MimeType.JSON,
      };

      get("http://localhost/ok", headers);
    });

    it("without custom headers", () => {
      get("http://localhost/ok");
      nock.isDone();
    });

    it("error with json", async () => {
      const errorMessage = "Error message";
      nock("http://localhost")
        .defaultReplyHeaders({
          "Content-Type": MimeType.JSON,
        })
        .get("/error")
        .reply(404, {message: errorMessage});

      expect.assertions(1);

      try {
        await get("http://localhost/error");
      } catch (e) {
        if (e instanceof HttpError) {
          expect(e.message).toBe(errorMessage);
        }
      }

      nock.isDone();
    });

    it("error", async () => {
      const errorMessage = "Error message";
      nock("http://localhost")
        .defaultReplyHeaders({
          "Content-Type": MimeType.TEXT,
        })
        .get("/error")
        .reply(404, errorMessage);

      expect.assertions(1);

      try {
        await get("http://localhost/error");
      } catch (e) {
        if (e instanceof HttpError) {
          expect(e.message).toBe(errorMessage);
        }
      }

      nock.isDone();
    });

    it("error with unsupported mimetype", async () => {
      // Should use default statusText as message
      nock("http://localhost")
        .defaultReplyHeaders({
          "Content-Type": "whatever",
        })
        .get("/error")
        .reply(404);

      expect.assertions(1);

      try {
        await get("http://localhost/error");
      } catch (e) {
        if (e instanceof HttpError) {
          expect(e.message).toBe("Not Found");
        }
      }

      nock.isDone();
    });
  });
});
