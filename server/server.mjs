import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import mustacheExpress from "mustache-express";
import getDecorator from "./dekorator.mjs";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("views", `${__dirname}/../build`);
app.set("view engine", "mustache");
app.engine("html", mustacheExpress());

// Parse application/json
app.use(express.json());

app.use("/skjema/", express.static(path.join(__dirname, "../build"), { index: false }));

app.get("/skjema/internal/isAlive|isReady", (req, res) => res.sendStatus(200));

// Match everything except internal og static
app.use(/^(?!.*\/(internal|static)\/).*$/, (req, res) => {
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

const port = parseInt(process.env.PORT || "8080");
console.log("serving on ", port);
app.listen(port);

process.on("SIGTERM", () => setTimeout(() => console.log("Har sovet i 30 sekunder"), 30000));
