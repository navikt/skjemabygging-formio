import jwt from "jsonwebtoken";
import { config } from "../config/config.js";

const idportenAuthenticationHandler = (req, res, next) => {
  const innsendingHeader = req.header("Fyllut-Innsending");
  if (innsendingHeader === "digital") {
    const authHeader = req.header("Authorization");
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.sendStatus(401);
    }

    const tokenContent = jwt.decode(token, {});
    const currentTime = new Date().getTime() / 1000;
    const expired = tokenContent.exp - 10 < currentTime;
    if (expired || tokenContent.client_id !== config.idportenClientId || tokenContent.acr !== "Level4") {
      return res.sendStatus(401);
    }

    // TODO set res.locals.user?
  }
  next();
};

export default idportenAuthenticationHandler;
