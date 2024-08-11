import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import { connectDB } from "./db/connect.js";
import authRoutes from "./routes/auth.js";
import problemRoutes from "./routes/problems.js";
import submissionRoutes from "./routes/submissions.js";
import contestRoutes from "./routes/contests.js";
import cors from "cors";

dotenv.config();
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.json({ type: "application/json" }));
app.use(cors());

app.use("/auth", authRoutes);
app.use("/problems", problemRoutes);
app.use("/submission", submissionRoutes);
app.use("/contests", contestRoutes);

app.get("/healthcheck", (req, res) => {
    res.status(200).json("healthcheck");
});

app.use((err, req, res, next) => {
    const errStatus = err.status || 500;
    const errMessage = err.message || "something went worng!";
    return res.status(errStatus).json({
        sucess: false,
        status: errStatus,
        message: errMessage,
        stack: err.stack,
    });
});

app.listen(3000, async () => {
    const db_url = process.env.MONGO_URI;
    await connectDB(db_url);
    console.log("Listening on port 3000");
    console.log("Connected to DB");
});
