import { createMockJwt, mockRequest, mockResponse } from "../test/testHelpers";
import { ByggerRequest } from "../types";
import authHandler from "./authHandler";

const byggerAzureClientId = process.env.AZURE_APP_CLIENT_ID!;

const defaultPayload = {
  aud: byggerAzureClientId,
  name: "Jon",
};

describe("authHandler", () => {
  it("rejects request when authorization header is missing", () => {
    const req = mockRequest({}) as ByggerRequest;
    const res = mockResponse();
    const next = jest.fn();
    authHandler(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.sendStatus).toHaveBeenCalledWith(401);
  });

  it("reject request when jwt is (soon) expired", () => {
    const req = mockRequest({
      headers: { Authorization: `Bearer ${createMockJwt(defaultPayload, "5s")}` },
    }) as ByggerRequest;
    const res = mockResponse();
    const next = jest.fn();
    authHandler(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.sendStatus).toHaveBeenCalledWith(401);
  });

  it("parses jwt and puts user info on request", () => {
    const req = mockRequest({ headers: { Authorization: `Bearer ${createMockJwt(defaultPayload)}` } }) as ByggerRequest;
    const res = mockResponse();
    const next = jest.fn();
    authHandler(req, res, next);
    expect(res.sendStatus).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    const user = req.getUser?.();
    expect(user).toBeDefined();
    expect(user?.name).toEqual(defaultPayload.name);
  });
});
