import { requestUtil } from '@navikt/skjemadigitalisering-shared-backend';
import {
  CoverPageDownloadType,
  navFormUtils,
  ResponseError,
  TranslationLang,
} from '@navikt/skjemadigitalisering-shared-domain';
import { NextFunction, Request, Response } from 'express';
import { logger } from '../../../logger';
import {
  coverPageService,
  mergeFileService,
  sharedFormService,
  staticPdfService,
  translationService,
} from '../../../services';

const staticPdf = {
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    const formPath = requestUtil.getStringParam(req, 'formPath')!;

    try {
      const result = await staticPdfService.getAll({
        formPath,
      });
      res.json(result);
    } catch (error: any) {
      next(error);
    }
  },
  downloadPdf: async (req: Request, res: Response, next: NextFunction) => {
    const formPath = requestUtil.getStringParam(req, 'formPath')!;
    const languageCode = req.params.languageCode as TranslationLang;
    const coverPageData = req.body as CoverPageDownloadType;
    const coverPageToken = req.headers.AzureAccessToken as string;
    const mergePdfToken = req.headers.MergePdfToken as string;

    if (!coverPageData) {
      throw new ResponseError('BAD_REQUEST', 'Missing cover page data in request body');
    }

    try {
      const form = await sharedFormService.getForm({
        formPath,
        select: ['skjemanummer', 'title', 'components', 'properties'],
      });

      const translate = await translationService.createTranslate({ formPath, languageCode });
      const attachmentComponents = navFormUtils
        .flattenComponents(form.components)
        .filter((component) => component.type === 'attachment' && coverPageData.attachments.includes(component.key));
      const attachmentLabels = coverPageData.attachments.map((attachmentKey) => {
        const attachmentComponent = attachmentComponents.find((component) => component.key === attachmentKey);
        if (!attachmentComponent?.label) {
          return attachmentKey;
        }

        return translate ? translate(attachmentComponent.label) : attachmentComponent.label;
      });

      const coverPagePdf = await coverPageService.downloadCoverPage({
        languageCode,
        accessToken: coverPageToken,
        data: {
          ...coverPageData,
          attachments: attachmentLabels,
          form,
        },
        translate,
        formNumber: form.skjemanummer.replace(/^(\S+)/, '$1p'),
      });

      const staticPdf = await staticPdfService.downloadPdf({
        formPath,
        languageCode,
      });

      const attachmentStaticPdfs: string[] = [];

      for (const component of attachmentComponents) {
        if (component.properties?.vedleggskjema) {
          try {
            const attachmentStaticPdf = await staticPdfService.downloadPdf({
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
