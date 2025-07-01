import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
dotenv.config();

import userRoute from "./routes/user.routes.js";
import propertyRoute from "./routes/property.routes.js";
import connectToDb from "./db/db.js";

connectToDb();
const app = express();

app.use(clerkMiddleware());
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/user", userRoute);
app.use("/api/property", propertyRoute);

export default app;
