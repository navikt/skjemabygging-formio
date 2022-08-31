import correlator from "express-correlation-id";
import fetch from "node-fetch";
import { config } from "../../config/config";
import { toJsonOrThrowError } from "../../utils/errorHandling.js";

const { skjemabyggingProxyUrl } = config;

const exstream = {
  get: (req, res, next) => {
    console.log("***** Converting HTML to PDF using Exstream");
    return fetch(`${skjemabyggingProxyUrl}/exstream`, {
      headers: {
        Authorization: `Bearer ${req.headers.AzureAccessToken}`,
        "x-correlation-id": correlator.getId(),
      },
      method: "POST",
      body:
        "<html lang='no'>" +
        "<head>" +
        "<title>TEST PDF GENERATION</title>" +
        "<meta charset='UTF-8'>" +
        "</head>" +
        "<body>" +
        "<h1>This is a test</h1>" +
        "<p>How is this converted?</p>" +
        "<ul>" +
        "<li>This</li>" +
        "<li>is</li>" +
        "<li>a</li>" +
        "<li>list.</li>" +
        "</ul>" +
        "</body>" +
        "</html>",
    })
      .then(toJsonOrThrowError("Feil ved generering av PDF hos Exstream", true))
      .then((pdf) => {
        res.contentType("application/pdf");
        return res.send(pdf);
      })
      .catch((error) => {
        next(error);
      });
  },
};

export default exstream;
