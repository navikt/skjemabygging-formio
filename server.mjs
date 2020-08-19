import express from "express";
import path from "path";
import {fileURLToPath} from "url";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use("/skjema/", express.static(path.join(__dirname, "build")));

app.get("/skjema/internal/isAlive|isReady", (req, res) =>
  res.sendStatus(200)
);
app.get("/skjema/*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const port = parseInt(process.env.PORT || "8080");
console.log("serving on ", port);
app.listen(port);
