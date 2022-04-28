import { Request, Response } from "express";

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
