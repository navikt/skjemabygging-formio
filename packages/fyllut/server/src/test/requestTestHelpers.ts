import { jest } from "@jest/globals";
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
    json: jest.fn(),
    sendStatus: jest.fn(),
    header: jest.fn(),
    contentType: jest.fn(),
    send: jest.fn(),
  } as any as Response;
};

const mockNext = () => {
  return jest.fn() as any as NextFunction;
};

export { mockRequest, mockResponse, mockNext };
