import type { Response } from 'express';

interface RenderIndexHtmlOptions {
  decoratorFragments?: object;
  pageMeta?: object;
  statusCode?: number;
  umamiWebsiteId?: string;
}

const renderIndexHtml = (
  res: Response,
  { decoratorFragments = {}, pageMeta = {}, statusCode = 200, umamiWebsiteId }: RenderIndexHtmlOptions,
) => {
  res.setHeader('X-Robots-Tag', 'noindex');
  res.status(statusCode).render('index.html', {
    ...decoratorFragments,
    ...pageMeta,
    ...(umamiWebsiteId && { umamiWebsiteId }),
  });
};

export { renderIndexHtml };
export type { RenderIndexHtmlOptions };
