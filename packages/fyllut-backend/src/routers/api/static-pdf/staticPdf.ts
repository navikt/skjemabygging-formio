import {
  coverPageService,
  formService,
  mergeFileService,
  staticPdfService,
  translationService,
} from '@navikt/skjemadigitalisering-shared-backend';
import {
  CoverPageDownloadType,
  navFormUtils,
  ResponseError,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { config } from '../../../config/config';
import { logger } from '../../../logger';

const { formsApiUrl, skjemabyggingProxyUrl, sendInnConfig, useFormsApiStaging, skjemaDir, mocksEnabled } = config;

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
    const coverPageData = req.body as CoverPageDownloadType;
    const coverPageToken = req.headers.AzureAccessToken as string;
    const mergePdfToken = req.headers.MergePdfToken as string;

    if (!coverPageData) {
      throw new ResponseError('BAD_REQUEST', 'Missing cover page data in request body');
    }

    try {
      const form = await formService.getForm({
        baseUrl: formsApiUrl,
        formPath,
        select: ['skjemanummer', 'title', 'components', 'properties'],
        formsApiStaging: useFormsApiStaging,
        formsLocation: skjemaDir,
        mocksEnabled,
      });

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

      const attachmentComponents = navFormUtils
        .flattenComponents(form.components)
        .filter(
          (component) =>
            component.type === 'attachment' &&
            component.properties?.vedleggskjema &&
            coverPageData.attachments.includes(component.key),
        );

      for (const component of attachmentComponents) {
        if (component.properties?.vedleggskjema) {
          try {
            const attachmentStaticPdf = await staticPdfService.downloadPdf({
              baseUrl: formsApiUrl,
              formPath: component.properties?.vedleggskjema,
              languageCode,
            });
            attachmentStaticPdfs.push(attachmentStaticPdf);
            logger.debug(`Add attachments ${component.properties?.vedleggskjema} for static pdf ${formPath}.`);
          } catch (error) {
            logger.warn(`Failed to add attachments for ${formPath} static pdf.`, error);
          }
        }
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
