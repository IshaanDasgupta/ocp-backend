import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import problemRoutes from "./routes/problems.js";
import submissionRoutes from "./routes/submissions.js";
import contestRoutes from "./routes/contests.js";
import cors from "cors";
import mongoose from "mongoose";
import amqp from "amqplib/callback_api.js";

dotenv.config();
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.json({ type: "application/json" }));
app.use(cors());

app.use("/user", authRoutes);
app.use("/problem", problemRoutes);
app.use("/submission", submissionRoutes);
app.use("/contest", contestRoutes);

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

const connectToMongoDB = (url) => {
    return mongoose.connect(url, {});
};

export let rabbitMQ_channel;

const connectToRabbitMQ = (url) => {
    try {
        amqp.connect(url, function (error, connection) {
            if (error) {
                throw error;
            }

            connection.createChannel(function (error, channel) {
                if (error) {
                    throw error;
                }

                var queue = "submission_requests";

                channel.assertQueue(queue, {
                    durable: false,
                });

                rabbitMQ_channel = channel;
            });
        });
        console.log("Connected to rabbitMQ");
    } catch (err) {
        throw err;
    }
};

app.listen(8000, async () => {
    await connectToMongoDB(process.env.MONGODB_URI);
    await connectToRabbitMQ(process.env.RABBIT_MQ_URI);
    console.log("Listening on port 8000");
    console.log("Connected to DB");
});
