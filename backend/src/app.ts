import express from 'express';
import cors from 'cors';
import reportRouter from './routes/ReportRoute';
import authRouter from './routes/AuthRoute';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/reports', reportRouter);
app.use('/api/auth', authRouter);

export default app;
