import express from "express";
import protect from "../middlewares/authMiddleware.js";
import adminOnly from "../middlewares/adminMiddleware.js";
import {
  acceptApply,
  downloadPDF,
  rejectApply,
  viewApply,
} from "../controller/adminController.js";

const adminRouter = express.Router();

adminRouter.get("/view/:id", protect, adminOnly, viewApply);

adminRouter.get("/accepted/:id", protect, adminOnly, acceptApply);

adminRouter.post("/rejected/:id", protect, adminOnly, rejectApply);

adminRouter.get("/download/pdf/:id", protect, adminOnly, downloadPDF);



export default adminRouter;
