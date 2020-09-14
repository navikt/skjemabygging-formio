import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import mustacheExpress from "mustache-express";
import getDecorator from "./dekorator.mjs";
import {Pdfgen} from "./pdfgen.js";

const app = express();
const skjemaApp = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse application/json
skjemaApp.use(express.json());
skjemaApp.use(express.urlencoded({extended: true}));
skjemaApp.set("views", `${__dirname}/../build`);
skjemaApp.set("view engine", "mustache");
skjemaApp.engine("html", mustacheExpress());

// form encoded post body
skjemaApp.post("/pdf-form", (req, res) => {
  const submission = JSON.parse(req.body.submission);
  const form = JSON.parse(req.body.form);
  console.log('submission', submission);
  res.contentType('application/pdf');
  Pdfgen.writePDFToStream(submission, form, res);
});


skjemaApp.use("/", express.static(path.join(__dirname, "../build"), { index: false }));

skjemaApp.get("/internal/isAlive|isReady", (req, res) => res.sendStatus(200));

// Match everything except internal og static
skjemaApp.use(/^(?!.*\/(internal|static)\/).*$/, (req, res) => {
  return getDecorator()
    .then((fragments) => {
      res.render("index.html", fragments);
    })
    .catch((e) => {
      const error = `Failed to get decorator: ${e}`;
      console.error(error);
      res.status(500).send(error);
    });
});

app.use('/skjema', skjemaApp);

const port = parseInt(process.env.PORT || "8080");
console.log("serving on ", port);
app.listen(port);

process.on("SIGTERM", () => setTimeout(() => console.log("Har sovet i 30 sekunder"), 30000));
