import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import logger from 'morgan';
import path from 'path';
import BaseRouter from './routes';

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use('/api', BaseRouter);

const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

export default app;
