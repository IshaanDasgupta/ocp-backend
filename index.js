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
import { createClient } from "redis";

dotenv.config();
const app = express();

export let redisClient;

const port = process.env.PORT || 4000;
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
    const errMessage = err.message || "something went wrong!";
    return res.status(errStatus).json({
        sucess: false,
        status: errStatus,
        message: errMessage,
        stack: err.stack,
    });
});

const connect_to_mongoDB = async () => {
    try {
        mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to mongoDB database");
    } catch (err) {
        throw err;
    }
};

export let rabbitMQ_channel;

const connect_to_rabbitMQ = () => {
    try {
        amqp.connect(process.env.RABBIT_MQ_URI, function (error, connection) {
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

const connect_to_redis = async () => {
    const client = createClient({
        password: process.env.REDIS_PASSWORD,
        socket: {
            host: process.env.REDIS_URI,
            port: process.env.REDIS_PORT,
        },
    });

    redisClient = client;
    await redisClient.connect();
    console.log("Connected to redis");
};

app.listen(port, async () => {
    try{
        await connect_to_redis();
    }
    catch(error){
        console.log(error);
    }
    finally{
        await connect_to_mongoDB();
        connect_to_rabbitMQ();
        console.log("Listening on port 8000");
    }
});
