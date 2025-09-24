import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { notFoundHandler } from "./middlewares/notfoundHandler";
import logger from "./lib/logger";
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import deviceRoutes from './routes/device.route';
import imsiRoutes from './routes/imsi.routes';




dotenv.config();
const app = express();
const prisma = new PrismaClient();


app.use(cors());
app.use(express.json());


// // Routes

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/imsi', imsiRoutes);

app.use(notFoundHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    logger.info(`🚀 Server running on http://localhost:${PORT}`);

});
