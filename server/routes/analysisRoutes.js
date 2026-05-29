import express from "express";
import auth from "../middleware/auth.js";
import {
  analyzeUrl,
  deleteAnaylsis,
  getAnalysis,
  getAnaylses,
} from "../controllers/analysisController.js";

const analysisRouter = express.Router();

analysisRouter.post("/analyze", auth, analyzeUrl);
analysisRouter.get("/list", auth, getAnaylses);
analysisRouter.get("/:id", auth, getAnalysis);
analysisRouter.delete("/:id", auth, deleteAnaylsis);

export default analysisRouter;
