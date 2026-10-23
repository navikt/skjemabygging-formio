import jwt from 'jsonwebtoken';
import { logger } from '../../shared/logger/logger';
import { createNologinTokenService } from './nologinTokenService';

const jwtSecret = 'nologin-test-secret';
const tokenLifetimeHours = 6;
const service = createNologinTokenService({ jwtSecret, tokenLifetimeHours });

describe('createNologinTokenService', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('generates a token with the existing claims and absolute lifetime', () => {
    const token = service.generateToken();
    const payload = jwt.verify(token, jwtSecret);

    expect(payload).toEqual(
      expect.objectContaining({
        purpose: 'nologin',
        innsendingsId: expect.any(String),
        iat: expect.any(Number),
        exp: expect.any(Number),
      }),
    );
    if (typeof payload !== 'object' || !payload?.iat || !payload.exp) {
      throw new Error('Expected generated token to contain timestamps');
    }
    expect(payload.exp - payload.iat).toBe(tokenLifetimeHours * 60 * 60);
  });

  it('verifies a valid no-login token', () => {
    const token = jwt.sign({ purpose: 'nologin', innsendingsId: 'submission-id' }, jwtSecret, {
      expiresIn: '2h',
    });

    expect(service.verifyToken(token)).toEqual(
      expect.objectContaining({
        purpose: 'nologin',
        innsendingsId: 'submission-id',
      }),
    );
  });

  it('rejects a token with the wrong purpose', () => {
    const token = jwt.sign({ purpose: 'other' }, jwtSecret, { expiresIn: '2h' });

    expect(service.verifyToken(token)).toBeNull();
  });

  it('rejects and safely logs an expired token', () => {
    const infoSpy = vi.spyOn(logger, 'info');
    const token = jwt.sign({ purpose: 'nologin', innsendingsId: 'submission-id' }, jwtSecret, {
      expiresIn: '0s',
    });

    expect(service.verifyToken(token)).toBeNull();
    expect(infoSpy).toHaveBeenCalledWith('Nologin token has expired', {
      errorMessage: 'jwt expired',
      correlationId: undefined,
    });
    expect(JSON.stringify(infoSpy.mock.calls)).not.toContain(token);
  });

  it('rejects and safely logs a token issued by another service', () => {
    const warnSpy = vi.spyOn(logger, 'warn');
    const otherService = createNologinTokenService({
      jwtSecret: 'another-secret',
      tokenLifetimeHours,
    });
    const token = otherService.generateToken();

    expect(service.verifyToken(token)).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith('Failed to verify nologin token', {
      errorMessage: 'invalid signature',
      correlationId: undefined,
    });
    expect(JSON.stringify(warnSpy.mock.calls)).not.toContain(token);
  });

  it('rethrows unexpected verification errors', () => {
    const unexpectedError = new Error('Unexpected verification failure');
    vi.spyOn(jwt, 'verify').mockImplementation(() => {
      throw unexpectedError;
    });

    expect(() => service.verifyToken('token')).toThrow(unexpectedError);
  });
});
