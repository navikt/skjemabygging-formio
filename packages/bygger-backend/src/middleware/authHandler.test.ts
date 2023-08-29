import nock from "nock";
import jose from "node-jose";
import { createMockJwt, generateJwk, mockRequest, mockResponse } from "../test/testHelpers";
import { ByggerRequest } from "../types";
import authHandler from "./authHandler";

const byggerAzureClientId = process.env.AZURE_APP_CLIENT_ID!;
const byggerAzureIssuer = process.env.AZURE_OPENID_CONFIG_ISSUER!;

const defaultPayload = {
  aud: byggerAzureClientId,
  iss: byggerAzureIssuer,
  name: "Jon",
};

describe("authHandler", () => {
  let key: jose.JWK.Key;
  beforeAll(async () => {
    key = await generateJwk();
    nock("https://login.unittest.no")
      .get("/tenant-id/discovery/v2.0/keys")
      .reply(200, { keys: [key.toJSON(false)] });
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("rejects request when authorization header is missing", async () => {
    console.error = vi.fn();
    console.log = vi.fn();
    const req = mockRequest({}) as ByggerRequest;
    const res = mockResponse();
    const next = vi.fn();
    await authHandler(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.sendStatus).toHaveBeenCalledWith(401);
  });

  it("rejects request when jwt is (soon) expired", async () => {
    const req = mockRequest({
      headers: { Authorization: `Bearer ${await createMockJwt(defaultPayload, key, "5s")}` },
    }) as ByggerRequest;
    const res = mockResponse();
    const next = vi.fn();
    await authHandler(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.sendStatus).toHaveBeenCalledWith(401);
  });

  it("rejects request when audience is wrong", async () => {
    const token = await createMockJwt({ ...defaultPayload, aud: "random" }, key, "5s");
    const req = mockRequest({
      headers: { Authorization: `Bearer ${token}` },
    }) as ByggerRequest;
    const res = mockResponse();
    const next = vi.fn();
    await authHandler(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.sendStatus).toHaveBeenCalledWith(401);
  });

  it("parses jwt and puts user info on request", async () => {
    const req = mockRequest({
      headers: { Authorization: `Bearer ${await createMockJwt(defaultPayload, key)}` },
    }) as ByggerRequest;
    const res = mockResponse();
    const next = vi.fn();
    await authHandler(req, res, next);
    expect(res.sendStatus).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    const user = req.getUser?.();
    expect(user).toBeDefined();
    expect(user?.name).toEqual(defaultPayload.name);
  });
});
