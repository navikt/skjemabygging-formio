import jwt, { JwtPayload } from 'jsonwebtoken';
import { ConfigType } from '../../config/types';
import { logger } from '../../logger';

const TOKEN_PURPOSE = 'nologin';

const NologinService = (config: ConfigType) => ({
  generateToken: (): string => {
    const innsendingsId = crypto.randomUUID();
    const { jwtSecret, tokenLifetimeHours } = config.nologin;
    return jwt.sign({ purpose: TOKEN_PURPOSE, innsendingsId }, jwtSecret, { expiresIn: `${tokenLifetimeHours}h` });
  },
  verifyToken: (token: string): JwtPayload | null => {
    try {
      const payload = jwt.verify(token as string, config.nologin.jwtSecret) as jwt.JwtPayload | string;
      if (typeof payload !== 'object' || payload === null || (payload as jwt.JwtPayload).purpose !== TOKEN_PURPOSE) {
        return null;
      }
      return payload;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        logger.info('Nologin token has expired', { errorMessage: err.message });
        return null;
      }
      if (err instanceof jwt.JsonWebTokenError) {
        logger.warn('Failed to verify nologin token', { errorMessage: err.message });
        return null;
      }
      throw err;
    }
  },
});

export default NologinService;
