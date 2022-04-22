import { config } from "../../config/config";
import { Pdfgen, PdfgenPapir } from "../../pdfgen.js";

const { gitVersion } = config;

const formRequestHandler = (req) => {
  const submission = JSON.parse(req.body.submission);
  const form = JSON.parse(req.body.form);
  const translations = JSON.parse(req.body.translations);
  return [form, submission, translations];
};

const pdfGenHandler = (pdfGenClass, requestHandler) => {
  return (req, res) => {
    const [form, submission, translations] = requestHandler(req);
    res.contentType("application/pdf");
    pdfGenClass.generatePdf(submission, form, gitVersion, res, translations);
  };
};

const pdf = {
  DIGITAL: { post: pdfGenHandler(Pdfgen, formRequestHandler) },
  PAPIR: { post: pdfGenHandler(PdfgenPapir, formRequestHandler) },
};

export default pdf;
