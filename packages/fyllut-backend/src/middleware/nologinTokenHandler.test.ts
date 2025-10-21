import jwt from 'jsonwebtoken';
import { config } from '../config/config';
import { mockRequest, mockResponse } from '../test/testHelpers';
import nologinTokenHandler from './nologinTokenHandler';

describe('nologinTokenHandler', () => {
  it('should verify a valid nologin token and set nologin context on request', () => {
    const token = jwt.sign({ purpose: 'nologin', innsendingsId: '123' }, config.nologin.jwtSecret, { expiresIn: '2h' });
    const req = mockRequest({ headers: { NologinToken: token } });
    const res = mockResponse();
    const next = vi.fn();
    nologinTokenHandler(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.getNologinContext).toBeDefined();

    const context = req.getNologinContext()!;
    expect(context.innsendingsId).toBe('123');
  });

  it('should fail due to invalid purpose', () => {
    const token = jwt.sign({ purpose: 'other' }, config.nologin.jwtSecret, { expiresIn: '2h' });
    const req = mockRequest({ headers: { NologinToken: token } });
    const res = mockResponse();
    const next = vi.fn();
    nologinTokenHandler(req, res, next);

    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
    expect(req.getNologinContext).toBeUndefined();
  });

  it('should fail since token is expired', () => {
    const token = jwt.sign({ purpose: 'other' }, config.nologin.jwtSecret, { expiresIn: '0s' });
    const req = mockRequest({ headers: { NologinToken: token } });
    const res = mockResponse();
    const next = vi.fn();
    nologinTokenHandler(req, res, next);

    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
    expect(req.getNologinContext).toBeUndefined();
  });

  it('should fail when token is malformed', () => {
    const req = mockRequest({ headers: { NologinToken: 'not-a-valid-jwt' } });
    const res = mockResponse();
    const next = vi.fn();
    nologinTokenHandler(req, res, next);

    expect(res.sendStatus).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
    expect(req.getNologinContext).toBeUndefined();
  });

  it('should fail due to missing token', () => {
    const req = mockRequest({ headers: {} });
    const res = mockResponse();
    const next = vi.fn();
    nologinTokenHandler(req, res, next);

    expect(res.sendStatus).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
    expect(req.getNologinContext).toBeUndefined();
  });
});
