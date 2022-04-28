import { NextFunction, Request, Response } from "express";
import backendInstance from "./helpers/backend-instance";

const enhetsliste = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const enhetsListe = await backendInstance.fetchEnhetsliste();
    res.send(enhetsListe);
  } catch (error) {
    next(error);
  }
};

export default enhetsliste;
