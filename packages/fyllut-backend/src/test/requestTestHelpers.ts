import { NextFunction, Request, Response } from "express";

interface mockRequestType {
  headers?: object;
  body?: object;
}

const mockRequest = ({ headers = {}, body = {} }: mockRequestType) => {
  return {
    body,
    headers,
    get: () => "",
  } as any as Request;
};

const mockResponse = () => {
  return {
    json: vi.fn(),
    sendStatus: vi.fn(),
    header: vi.fn(),
    contentType: vi.fn(),
    send: vi.fn(),
  } as any as Response;
};

const mockNext = () => {
  return vi.fn() as any as NextFunction;
};

export { mockRequest, mockResponse, mockNext };
