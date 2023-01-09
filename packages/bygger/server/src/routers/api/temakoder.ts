import { NextFunction, Request, Response } from "express";
import { backendInstance } from "../../services";

const temakoder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const temakoder = await backendInstance.fetchTemakoder();
    res.send(temakoder);
  } catch (error) {
    next(error);
  }
};

export default temakoder;
