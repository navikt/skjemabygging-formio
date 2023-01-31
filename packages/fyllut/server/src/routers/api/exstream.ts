import {
  I18nTranslationMap,
  Language,
  localizationUtils,
  NavFormType,
  Submission,
} from "@navikt/skjemadigitalisering-shared-domain";
import { NextFunction, Request, Response } from "express";
import correlator from "express-correlation-id";
import fetch, { HeadersInit } from "node-fetch";
import { config } from "../../config/config";
import { base64Decode, base64Encode } from "../../utils/base64";
import { responseToError } from "../../utils/errorHandling.js";
import { createHtmlFromSubmission } from "./helpers/htmlBuilder";

const { skjemabyggingProxyUrl, gitVersion } = config;

const parseBody = (
  req: Request
): {
  form: NavFormType;
  submission: Submission;
  submissionMethod: string;
  translations: I18nTranslationMap;
  language: Language;
} => {
  const submission = JSON.parse(req.body.submission);
  const submissionMethod = req.body.submissionMethod;
  const form = JSON.parse(req.body.form);
  const translations = JSON.parse(req.body.translations);
  const language = req.body.language;
  return { form, submission, submissionMethod, translations, language };
};

const exstream = {
  post: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { form, submission, submissionMethod, translations, language } = parseBody(req);
      const pdf = await createPdf(
        req.headers.AzureAccessToken as string,
        form,
        submission,
        submissionMethod,
        translations,
        localizationUtils.getLanguageCodeAsIso639_1(language)
      );
      res.contentType(pdf.contentType);
      res.send(base64Decode(pdf.data));
    } catch (e) {
      next(e);
    }
  },
};

export const createPdfAsByteArray = async (
  accessToken: string,
  form: NavFormType,
  submission: Submission,
  submissionMethod: string,
  translations: I18nTranslationMap,
  language: string,
  pid: string
) => {
  const pdf = await createPdf(accessToken, form, submission, submissionMethod, translations, language, pid);
  return Array.from(base64Decode(pdf.data));
};

const createPdf = async (
  accessToken: string,
  form: NavFormType,
  submission: Submission,
  submissionMethod: string,
  translations: I18nTranslationMap,
  language: string,
  pid?: string
) => {
  const translate = (text: string): string => translations[text] || text;
  const html = createHtmlFromSubmission(form, submission, submissionMethod, translate, language);
  return await createPdfFromHtml(accessToken, translate(form.title), form.properties.skjemanummer, language, html, pid);
};

const createPdfFromHtml = async (
  azureAccessToken: string,
  title: string,
  skjemanummer: string,
  language: string,
  html: string,
  pid?: string
) => {
  if (!html || Object.keys(html).length === 0) {
    throw Error("Missing HTML for generating PDF.");
  }

  const response = await fetch(`${skjemabyggingProxyUrl}/exstream`, {
    headers: {
      Authorization: `Bearer ${azureAccessToken}`,
      "x-correlation-id": correlator.getId(),
      "Content-Type": "application/json",
    } as HeadersInit,
    method: "POST",
    body: JSON.stringify({
      content: {
        contentType: "application/json",
        data: base64Encode(
          JSON.stringify({
            dokumenttypeId: "fs_001",
            dokumentTittel: title,
            arkivSystem: "INGEN",
            spraakkode: language,
            blankettnr: skjemanummer,
            brukersFnr: pid,
            skjemaversjon: gitVersion,
            html: base64Encode(html),
          })
        ),
        async: "true",
      },
      RETURNFORMAT: "PDF",
      RETURNDATA: "TRUE",
    }),
  });

  if (response.ok) {
    const json = await response.json();
    return json.data.result[0].content;
  }

  throw await responseToError(response, "Feil ved generering av PDF hos Exstream", true);
};

export default exstream;
