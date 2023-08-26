import express from "express";
import { config } from "dotenv";
import cors from "cors";
import { errorHandler, notFound } from "./middlewares/errorMiddleware.js";
import userRouter from "./routes/userRoute.js";
import applyRouter from "./routes/applyRoute.js";
import contactRouter from "./routes/contactRoute.js";
import adminRouter from "./routes/adminRoute.js";
config();
const app = express();

app.use(express.json());

app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

app.use("/api/v1/users", userRouter);

app.use("/api/v1/applies", applyRouter);

app.use("/api/v1/admins", adminRouter);

app.use("/api/v1/contacts", contactRouter);

app.use(notFound);

app.use(errorHandler);

export default app;
