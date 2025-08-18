import jwt, { JwtPayload } from 'jsonwebtoken';
import { ConfigType } from '../../config/types';

const TOKEN_PURPOSE = 'nologin';

const NologinService = (config: ConfigType) => ({
  generateToken: (): string => {
    return jwt.sign({ purpose: TOKEN_PURPOSE }, config.nologin.jwtSecret, { expiresIn: '2h' });
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
        return null;
      }
      if (err instanceof jwt.JsonWebTokenError) {
        throw new Error(`Nologin token verification failed: ${err.message}`);
      }
      throw err;
    }
  },
});

export default NologinService;
