import "dotenv/config";
import express from "express";
import cors from "cors";
import { logger } from './middleware/logger.js';
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { errors } from "celebrate";
import {errorHandler} from "./middleware/errorHandler.js"
import { connectMongoDB } from './db/connectMongoDB.js';
import notesRoutes from './routes/notesRoutes.js';
import authRoutes from './routes/authRoutes.js';
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT ?? 3030

app.use(express.json());
app.use(cors());
app.use(logger);
app.use(cookieParser());

app.use(notesRoutes);
app.use(authRoutes);


await connectMongoDB();

app.use(notFoundHandler);
app.use(errors());
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
