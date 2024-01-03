import { Request, Response, Router } from 'express';
import url from 'url';

export const stripTrailingSlash = (router: Router) => {
  // Match everything with trailing slash, except for root (/)
  router.use(/^.+\/$/, (req: Request, res: Response) => {
    return res.redirect(
      308,
      url.format({
        pathname: req.baseUrl,
        query: req.query as { [key: string]: string },
      }),
    );
  });
};
