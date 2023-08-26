import express from "express";
import { createContact } from "../controller/contactController.js";

const contactRouter = express.Router();

contactRouter.post("/create",  createContact);

export default contactRouter;
