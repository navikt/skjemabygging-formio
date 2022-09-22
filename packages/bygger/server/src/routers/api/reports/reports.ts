import { RequestHandler } from "express";
import { reportService } from "../../../services";

const reports: RequestHandler = async (req, res) => {
  res.json(reportService.getAllReports());
};

export default reports;
