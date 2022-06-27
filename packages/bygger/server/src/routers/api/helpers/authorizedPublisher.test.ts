import nock from "nock";
import config from "../../../config";
import { mockRequest, mockResponse } from "../../../test/testHelpers";
import authorizedPublisher from "./authorizedPublisher";

describe("authorizedPublisher", () => {
  const projectUrl = config.formio.projectUrl;

  beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  it("Accepts formio token in body", async () => {
    nock(projectUrl).get("/current").reply(204);
    const req = mockRequest({
      body: {
        token: "valid-formio-token",
      },
    });
    const res = mockResponse();
    const next = jest.fn();
    await authorizedPublisher(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeUndefined();
  });

  it("Accepts formio token in header", async () => {
    nock(projectUrl).get("/current").reply(204);
    const req = mockRequest({
      headers: {
        "Bygger-Formio-Token": "valid-formio-token",
      },
      body: {
        foo: "bar",
      },
    });
    const res = mockResponse();
    const next = jest.fn();
    await authorizedPublisher(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0]).toBeUndefined();
  });

  it("Rejects request when formio token is missing", async () => {
    const req = mockRequest({
      body: {
        token: undefined,
      },
    });
    const res = mockResponse();
    const next = jest.fn();
    await authorizedPublisher(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    const nextArg = next.mock.calls[0][0];
    expect(nextArg).toBeDefined();
    expect(nextArg.message).toEqual("Missing formio token");
  });

  it("Rejects request when formio token is invalid", async () => {
    nock(projectUrl).get("/current").reply(401);
    const req = mockRequest({
      body: {
        token: "invalid-formio-token",
      },
    });
    const res = mockResponse();
    const next = jest.fn();
    await authorizedPublisher(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    const nextArg = next.mock.calls[0][0];
    expect(nextArg).toBeDefined();
    expect(nextArg.message).toEqual("Invalid formio token");
  });
});
