import { get, HttpError, MimeType } from "./http";
import nock from "nock";

interface TestBody {
  body: string;
}
const defaultBodyText = "This is the body";
const setupDefaultGetMock = () => {
  nock("https://www.nav.no")
    .defaultReplyHeaders({
      "Content-Type": MimeType.JSON,
    })
    .get("/ok")
    .reply(200, {
      body: defaultBodyText
    });
}

describe("http requests", () => {
  describe("get", () => {
    it("with custom headers", async () => {
      setupDefaultGetMock();
      const headers = {
        "Content-Type": MimeType.TEXT,
      };

      const response = await get<TestBody>("https://www.nav.no/ok", headers);
      expect(typeof response).toBe("object")
      expect(response.body).toBe(defaultBodyText)
      nock.isDone();
    });

    it("without custom headers", async () => {
      setupDefaultGetMock();
      const response = await get<TestBody>("https://www.nav.no/ok");
      expect(response.body).toBe(defaultBodyText)
      nock.isDone();
    });

    it("with text response", async () => {
      nock("https://www.nav.no")
        .defaultReplyHeaders({
          "Content-Type": MimeType.TEXT,
        })
        .get("/ok")
        .reply(200, {
          body: "This is the body"
        });
      const headers = {
        "Content-Type": MimeType.TEXT,
      };

      const response = await get("https://www.nav.no/ok", headers);
      expect(typeof response).toBe("string")
      nock.isDone();
    });

    it("error with json", async () => {
      const errorMessage = "Error message";
      nock("https://www.nav.no")
        .defaultReplyHeaders({
          "Content-Type": MimeType.JSON,
        })
        .get("/error")
        .reply(404, {message: errorMessage});

      expect.assertions(1);

      try {
        await get("https://www.nav.no/error");
      } catch (e) {
        if (e instanceof HttpError) {
          expect(e.message).toBe(errorMessage);
        }
      }

      nock.isDone();
    });

    it("error", async () => {
      const errorMessage = "Error message";
      nock("https://www.nav.no")
        .defaultReplyHeaders({
          "Content-Type": MimeType.TEXT,
        })
        .get("/error")
        .reply(404, errorMessage);

      expect.assertions(1);

      try {
        await get("https://www.nav.no/error");
      } catch (e) {
        if (e instanceof HttpError) {
          expect(e.message).toBe(errorMessage);
        }
      }

      nock.isDone();
    });

    it("error with unsupported mimetype", async () => {
      // Should use default statusText as message
      nock("https://www.nav.no")
        .defaultReplyHeaders({
          "Content-Type": "whatever",
        })
        .get("/error")
        .reply(404);

      expect.assertions(1);

      try {
        await get("https://www.nav.no/error");
      } catch (e) {
        if (e instanceof HttpError) {
          expect(e.message).toBe("Not Found");
        }
      }

      nock.isDone();
    });
  });
});
