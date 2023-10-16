import { Mock } from 'vitest';
import { logger } from '../logger';
import { containsIgnoredString, logFormNotFound } from './formError';

vi.mock('../logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe('containsIgnoredString', () => {
  it('returns true when ignored string is present', () => {
    expect(containsIgnoredString('/core/index')).toBe(true);
    expect(containsIgnoredString('login.php')).toBe(true);
    expect(containsIgnoredString('admin/config')).toBe(true);
  });

  it('returns false when ignored string is not present', () => {
    expect(containsIgnoredString('nonExistentPath')).toBe(false);
    expect(containsIgnoredString('nav123456')).toBe(false);
  });

  it('is case insensitive', () => {
    expect(containsIgnoredString('AdmiN/index')).toBe(true);
    expect(containsIgnoredString('Core/Index')).toBe(true);
  });
});

describe('logFormNotFound', () => {
  beforeEach(() => {
    (logger.error as Mock).mockClear();
    (logger.warn as Mock).mockClear();
    (logger.info as Mock).mockClear();
  });

  it('calls logger.warn when path is similar to a NAV form number', () => {
    logFormNotFound('nav123456.asdfaw3asdf');
    expect(logger.warn).toHaveBeenCalled();
  });

  it("calls logger.info when path doesn't contain ignored string", () => {
    logFormNotFound('nonExistentPath');
    expect(logger.info).toHaveBeenCalled();
  });

  it('does not call logger.error when path contains ignored string', () => {
    logFormNotFound('index.php');
    expect(logger.error).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.info).not.toHaveBeenCalled();
  });

  it('logger.info is called with correct arguments', () => {
    const path = 'nonExistentPath';
    logFormNotFound(path);
    expect(logger.info).toHaveBeenCalledWith('Form not found', { formPath: path });
  });
});
