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
  appMetrics,
  coverPageService,
  formService,
  mergeFileService,
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
    const languageCode = requestUtil.getStringParam(req, 'languageCode') as TranslationLang;
    const coverPageData = req.body as CoverPageDownloadType;
    const coverPageToken = requestUtil.getAzureAccessToken(req);
    const mergePdfToken = requestUtil.getMergePdfToken(req);

    if (!coverPageData || typeof coverPageData !== 'object' || Array.isArray(coverPageData)) {
      throw new ResponseError('BAD_REQUEST', 'Missing cover page data in request body');
    }

    try {
      const isEttersending = coverPageData.type === 'ETTERSENDELSE';
      const { type: _, ...coverPageDataWithoutType } = coverPageData;
      const validatedCoverPageData: CoverPageDownloadType = isEttersending
        ? { ...coverPageDataWithoutType, type: 'ETTERSENDELSE' }
        : coverPageDataWithoutType;
      const form = await formService.getForm({
        formPath,
        select: ['skjemanummer', 'title', 'components', 'properties'],
      });

      const translate = await translationService.createTranslate({ formPath, languageCode });
      const selectedAttachmentKeys = Array.isArray(coverPageData.attachments) ? coverPageData.attachments : [];

      const attachmentComponents = navFormUtils
        .flattenComponents(form.components)
        .filter((component) => component.type === 'attachment' && selectedAttachmentKeys.includes(component.key));
      if (isEttersending && attachmentComponents.length === 0) {
        throw new ResponseError('BAD_REQUEST', 'At least one valid attachment must be selected for ettersending');
      }

      const resolvedAttachmentKeys = isEttersending
        ? selectedAttachmentKeys.filter((attachmentKey) =>
            attachmentComponents.some((component) => component.key === attachmentKey),
          )
        : selectedAttachmentKeys;
      const attachmentLabels = resolvedAttachmentKeys.map((attachmentKey) => {
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
          ...validatedCoverPageData,
          attachments: attachmentLabels,
          form,
        },
        translate,
        formNumber: isEttersending ? form.skjemanummer : form.skjemanummer.replace(/^(\S+)/, '$1p'),
      });

      const staticPdf = isEttersending
        ? undefined
        : await staticPdfService.downloadPdf({
            formPath,
            languageCode,
          });

      const attachmentStaticPdfs: string[] = [];

      for (const component of attachmentComponents) {
        if (component.properties?.vedleggskjema) {
          try {
            const attachmentStaticPdf = await staticPdfService.downloadPdf({
              formPath: component.properties.vedleggskjema,
              languageCode,
            });
            attachmentStaticPdfs.push(attachmentStaticPdf);
            logger.debug(`Add attachments ${component.properties.vedleggskjema} for static pdf ${formPath}.`);
          } catch (error) {
            logger.warn(`Failed to add attachments for ${formPath} static pdf.`, error);
          }
        }
      }

      const pdf =
        isEttersending && attachmentStaticPdfs.length === 0
          ? coverPagePdf
          : await mergeFileService.mergeFiles({
              accessToken: mergePdfToken,
              body: {
                title: form.title,
                language: languageCode,
                files: isEttersending
                  ? [coverPagePdf, ...attachmentStaticPdfs]
                  : [coverPagePdf, staticPdf!, ...attachmentStaticPdfs],
              },
            });

      res.json({ pdfBase64: pdf });
      if (isEttersending) {
        appMetrics.paperSubmissionsCounter.inc({ source: 'ettersending' });
      }
    } catch (error: any) {
      next(error);
    }
  },
};

export default staticPdf;
