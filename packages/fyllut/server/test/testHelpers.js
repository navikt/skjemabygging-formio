import { jest } from "@jest/globals";

function mockResponse() {
  return {
    json: jest.fn(),
    sendStatus: jest.fn(),
    header: jest.fn(),
  };
}

function mockRequest({ headers = {}, body }) {
  return {
    header: (name) => headers[name],
    body,
  };
}

export { mockRequest, mockResponse };
