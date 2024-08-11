import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { connectDB } from './db/connect.js';
// import authRoutes from './routes/auth.js';
import problemRoutes from './routes/problems.js';
import submissionRoutes from './routes/submissions.js';
import contestRoutes from './routes/contests.js';
import compilationRoutes from './routes/compilationRoutes.js'
import cors from 'cors';

dotenv.config();
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.json({ type: 'application/json' }));
app.use(cors());

// app.use('/auth', authRoutes);
app.use('/problems', problemRoutes);
app.use('/submission', submissionRoutes);
app.use('/contests', contestRoutes);
app.use("/api/compilation", compilationRoutes);

app.get('/', (req, res) => {
  console.log('hello');
  res.json('hello');
});

app.listen(3000, async () => {
  const dbUrl = process.env.MONGO_URI;
  await connectDB(dbUrl);
  console.log('Listening on port 3000');
  console.log('Connected to DB');
});
