import {
  coverPageService,
  formService,
  mergeFileService,
  staticPdfService,
  translationService,
} from '@navikt/skjemadigitalisering-shared-backend';
import {
  CoverPageType,
  navFormUtils,
  ResponseError,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { config } from '../../../config/config';
import { logger } from '../../../logger';

const { formsApiUrl, skjemabyggingProxyUrl, sendInnConfig } = config;

const staticPdf = {
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    const { formPath } = req.params;

    try {
      const result = await staticPdfService.getAll({
        baseUrl: formsApiUrl,
        formPath,
      });
      res.json(result);
    } catch (error: any) {
      next(error);
    }
  },
  downloadPdf: async (req: Request, res: Response, next: NextFunction) => {
    const { formPath } = req.params;
    const languageCode = req.params.languageCode as TranslationLang;
    const coverPageData = req.body as CoverPageType;
    const coverPageToken = req.headers.AzureAccessToken as string;
    const mergePdfToken = req.headers.MergePdfToken as string;

    if (!coverPageData) {
      throw new ResponseError('BAD_REQUEST', 'Missing cover page data in request body');
    }

    try {
      // TODO: Get form from published revision or get from github
      const form = await formService.getForm({ baseUrl: formsApiUrl, formPath });

      const translate = await translationService.createTranslate({ baseUrl: formsApiUrl, formPath, languageCode });

      const coverPagePdf = await coverPageService.downloadCoverPage({
        baseUrl: skjemabyggingProxyUrl,
        languageCode,
        accessToken: coverPageToken,
        data: {
          ...coverPageData,
          form,
        },
        translate,
      });

      const staticPdf = await staticPdfService.downloadPdf({
        baseUrl: formsApiUrl,
        formPath,
        languageCode,
      });

      const attachmentStaticPdfs: string[] = [];

      try {
        const attachmentComponents = navFormUtils
          .flattenComponents(form.components)
          .filter((component) => component.type === 'attachment' && component.properties?.vedleggskjema);

        for (const component of attachmentComponents) {
          const attachmentForm = await formService.getForm({
            baseUrl: formsApiUrl,
            formPath: component.properties?.vedleggskjema,
          });

          if (attachmentForm) {
            const attachmentStaticPdf = await staticPdfService.downloadPdf({
              baseUrl: formsApiUrl,
              formPath,
              languageCode,
            });
            attachmentStaticPdfs.push(attachmentStaticPdf);
          }
        }
      } catch (error) {
        logger.warn(`Failed to add attachments for ${formPath} static pdf.`, error);
      }

      const pdf = await mergeFileService.mergeFiles({
        baseUrl: `${sendInnConfig.host}${sendInnConfig.paths.mergeFiles}`,
        accessToken: mergePdfToken,
        body: {
          title: form.title,
          language: languageCode,
          files: [coverPagePdf, staticPdf, ...attachmentStaticPdfs],
        },
      });

      res.json({ pdfBase64: pdf });
    } catch (error: any) {
      next(error);
    }
  },
};

export default staticPdf;
