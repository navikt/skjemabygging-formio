import request from "supertest";
import { createApp } from "./app";

jest.mock("./logger.js");
jest.mock("./dekorator.js", () => ({
  getDecorator: () => {},
  createRedirectUrl: () => "",
}));

const IP_LOCALHOST = "127.0.0.1";
const IP_EXTERNAL = "192.168.2.1";
const IP_NAV = "10.255.255.255";

describe("Setup dev server", () => {
  describe("Dev setup is enabled", () => {
    const SETUP_DEV = true;

    describe("Request without fyllut-dev-access cookie", () => {
      it("is rejected", async () => {
        await request(createApp(SETUP_DEV)).get("/fyllut/").set("X-Forwarded-For", IP_EXTERNAL).expect(401);
      });

      it("is allowed when from localhost", async () => {
        await request(createApp(SETUP_DEV)).get("/fyllut/").set("X-Forwarded-For", IP_LOCALHOST).expect(200);
      });
    });

    describe("Request with fyllut-dev-access cookie", () => {
      it("is allowed", async () => {
        await request(createApp(SETUP_DEV))
          .get("/fyllut/")
          .set("X-Forwarded-For", IP_EXTERNAL)
          .set("Cookie", ["fyllut-dev-access=true"])
          .expect(200);
      });
    });

    describe("Request to /fyllut/test/login", () => {
      it("renders dev-access html", async () => {
        const res = await request(createApp(SETUP_DEV))
          .get("/fyllut/test/login")
          .set("X-Forwarded-For", IP_EXTERNAL)
          .expect(200);
        expect(res.headers["content-type"]).toContain("text/html");
        expect(res.text).toContain("Du har nå tilgang");
        expect(res.headers["set-cookie"][0]).toContain("fyllut-dev-access=true");
      });

      it("redirects to form if query param formPath exists when external ip", async () => {
        const res = await request(createApp(SETUP_DEV))
          .get("/fyllut/test/login?formPath=nav123456")
          .set("X-Forwarded-For", IP_EXTERNAL)
          .expect(302);
        expect(res.headers["location"]).toContain("/fyllut/nav123456");
        expect(res.headers["set-cookie"][0]).toContain("fyllut-dev-access=true");
      });

      it("redirects to form if query param formPath exists when NAV ip", async () => {
        const res = await request(createApp(SETUP_DEV))
          .get("/fyllut/test/login?formPath=nav123456")
          .set("X-Forwarded-For", IP_NAV)
          .expect(302);
        expect(res.headers["location"]).toContain("/fyllut/nav123456");
        expect(res.headers["set-cookie"][0]).toContain("fyllut-dev-access=true");
      });

      it("returns 400 bad request when formPath is invalid", async () => {
        const res = await request(createApp(SETUP_DEV))
          .get("/fyllut/test/login?formPath=suspektskjema")
          .set("X-Forwarded-For", IP_EXTERNAL)
          .expect(400);
        expect(res.headers["set-cookie"]).toBeUndefined();
      });
    });
  });
});
