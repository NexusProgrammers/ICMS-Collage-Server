import express from "express";
import protect from "../middlewares/authMiddleware.js";
import { applyFormValidator } from "../validators/applyValidator.js";
import {
  apply,
  updateApply,
  getApplies,
  getApply,
  deleteApply,
  getAcceptedApplies,
  getRejectedApplies,
  getTotalApplies,
  getNewApplies,
  getViewedApplies,
} from "../controller/applyController.js";

const applyRouter = express.Router();

applyRouter.post("/apply", protect, applyFormValidator, apply);

applyRouter.put("/update", protect, updateApply);

applyRouter.get("/all", getApplies);

applyRouter.get("/details/:id", getApply);

applyRouter.delete("/delete/:id", protect, deleteApply);

applyRouter.get("/accepted", getAcceptedApplies);

applyRouter.get("/rejected", getRejectedApplies);

applyRouter.get("/total", getTotalApplies);

applyRouter.get("/new", getNewApplies);

applyRouter.get("/view", getViewedApplies);

export default applyRouter;
