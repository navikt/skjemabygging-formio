import jwt from 'jsonwebtoken';
import { config } from '../config/config';

const createNologinToken = (innsendingsId: string, expiresIn: `${number}${'ms' | 's' | 'm' | 'h'}` | number = '1h') =>
  jwt.sign({ purpose: 'nologin', innsendingsId }, config.nologin.jwtSecret, { expiresIn });

export { createNologinToken };
