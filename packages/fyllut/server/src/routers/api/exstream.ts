import { NextFunction, Request, Response } from "express";
import correlator from "express-correlation-id";
import fetch, { HeadersInit } from "node-fetch";
import { config } from "../../config/config";
import { base64Decode, base64Encode } from "../../utils/base64";
import { responseToError } from "../../utils/errorHandling.js";

const { skjemabyggingProxyUrl } = config;

const testHtml =
  "<html lang='no'>" +
  "<head>" +
  "<title>TEST PDF GENERATION</title>" +
  "<meta charset='UTF-8'>" +
  "</head>" +
  "<body style='background-color: red;'>" +
  "<h1>This is a test</h1>" +
  "<p>How is this converted?</p>" +
  "<ul>" +
  "<li>This</li>" +
  "<li>is</li>" +
  "<li>a</li>" +
  "<li>list!</li>" +
  "</ul>" +
  "</body>" +
  "</html>";

const exstream = {
  // TODO: Change this to POST after testing done
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const pdf = await createPdf(req.headers.AzureAccessToken as string, "Test", testHtml);
      res.contentType(pdf.contentType);
      res.send(base64Decode(pdf.data));
    } catch (e) {
      next(e);
    }
  },
};

const createPdf = async (azureAccessToken: string, title: string, html: string) => {
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
