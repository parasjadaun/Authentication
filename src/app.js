import express from 'express';
import morgan from 'morgan';
import AuthRouter from './routes/auth.routes.js';
const app=express();

app.use(express.json());
app.use(morgan('dev'));
app.use('/api/auth',AuthRouter);

export default app;