import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Register router, contoh:
import reportRouter from './routes/ReportRoute';
app.use('/api/reports', reportRouter);

export default app;
