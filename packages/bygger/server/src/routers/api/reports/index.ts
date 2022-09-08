import express from "express";
import { adHandlers } from "../../../middleware/azureAd";
import { Report } from "../../../services/ReportService";
import reportHandler from "./report-handler";

const reportsRouter = express.Router();

reportsRouter.all("*", adHandlers.isAdmin);
reportsRouter.get("/forms-published-languages", reportHandler(Report.FORMS_PUBLISHED_LANGUAGES));

export default reportsRouter;
