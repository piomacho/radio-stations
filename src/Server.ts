import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import logger from 'morgan';
import path from 'path';
import BaseRouter from './routes';
import bodyParser from 'body-parser'
var http = require('http');

const app = express();

app.use(cors());
app.use(logger('dev'));
app.use(cookieParser());

app.use(bodyParser.json({limit: '500mb'}));
app.use(bodyParser.urlencoded({ extended: true, parameterLimit:500000 }));

app.use('/api', BaseRouter);

const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

export default app;
