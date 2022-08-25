import { config } from "../../config/config";
import { Pdfgen, PdfgenPapir } from "../../pdfgen.js";

const { gitVersion } = config;

const formRequestHandler = (req) => {
  const submission = JSON.parse(req.body.submission);
  const form = JSON.parse(req.body.form);
  const translations = JSON.parse(req.body.translations);
  const isTest = JSON.parse(req.body.isTest);
  return [form, submission, translations, isTest];
};

const pdfGenHandler = (pdfGenClass, requestHandler) => {
  return (req, res, next) => {
    const [form, submission, translations, isTest] = requestHandler(req);
    res.contentType("application/pdf");
    try {
      pdfGenClass.generatePdf(submission, form, gitVersion, res, translations, isTest);
    } catch (err) {
      next(err);
    }
  };
};

const pdf = {
  DIGITAL: { post: pdfGenHandler(Pdfgen, formRequestHandler) },
  PAPIR: { post: pdfGenHandler(PdfgenPapir, formRequestHandler) },
};

export default pdf;
