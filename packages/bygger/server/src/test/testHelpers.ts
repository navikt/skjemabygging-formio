import { Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.TEST_JWT_SECRET!;

export function mockResponse(): Response {
  return {
    json: jest.fn(),
    sendStatus: jest.fn(),
    header: jest.fn(),
  } as unknown as Response;
}

type MockRequestData = {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  body?: object | string;
};
export function mockRequest({ headers = {}, params = {}, body }: MockRequestData): Request {
  return {
    header: (name: string): string => headers[name] as string,
    params,
    body,
  } as unknown as Request;
}

export const createMockJwt = (payload: object, expiresIn = "5m") => {
  const obj = {
    token_type: "Bearer",
    ...payload,
  };
  return createAccessToken(obj, expiresIn);
};

const createAccessToken = (payload: object, expiresIn: string) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
};
