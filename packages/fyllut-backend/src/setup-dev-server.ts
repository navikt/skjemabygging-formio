import cookieParser from 'cookie-parser';
import { Express, NextFunction, Request, Response, Router } from 'express';
import { ConfigType } from './config/types';
import { logger } from './logger';

const DEV_ACCESS_COOKIE = 'fyllut-dev-access';

// 155.55.* is Navs public IP range. Also includes the private IP range used by our
// internal network (10.*), and localhost. Takes the IPv6 prefix ::ffff: into account.
const isNavIp = (ip: string) => /^(::ffff:)?(155\.55\.|10\.|127\.)/.test(ip);
const isFormPath = (value: string) => /^\w*$/.test(value);

export const setupDevServer = (expressApp: Express, fyllutRouter: Router, config: ConfigType) => {
  logger.info('Server setup dev');

  // Trust proxy IP headers, to ensure we get the actual req.ip for the client
  expressApp.set('trust proxy', true);

  expressApp.all('*', (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Robots-Tag', 'noindex');
    next();
  });

  // Sets a cookie which will bypass the IP restriction
  fyllutRouter.get('/test/login', (req: Request, res: Response) => {
    logger.debug('Dev access requested');
    const formPath = req.query.formPath as string;
    if (formPath) {
      if (isFormPath(formPath)) {
        res.cookie(DEV_ACCESS_COOKIE, true, { maxAge: 1000 * 3600 * 24 });
        return res.redirect(302, `${config.fyllutPath}/${formPath}`);
      } else {
        logger.warn(`Invalid formPath when requesting dev access: ${formPath}`);
        return res.sendStatus(400);
      }
    }
    res.cookie(DEV_ACCESS_COOKIE, true, { maxAge: 1000 * 3600 * 24 });
    return res.render('dev-access.html');
  });

  expressApp.all(/^(?!.*\/(test\/login|api)).*$/, cookieParser(), (req: Request, res: Response, next: NextFunction) => {
    if (isNavIp(req.ip) || req.cookies[DEV_ACCESS_COOKIE]) {
      logger.debug('Dev access is valid');
      return next();
    } else {
      logger.info(`Non-authorized client ips: ${req.ip} ${JSON.stringify(req.ips)}`);
      return res.status(401).send('Ingen tilgang');
    }
  });
};
