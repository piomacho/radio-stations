import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import logger from 'morgan';
import path from 'path';
import BaseRouter from './routes';
import bodyParser from 'body-parser'

const app = require('express')();
app.use(cors());
app.use(logger('dev'));
app.use(cookieParser());

app.use(bodyParser.json({limit: '500mb'}));
app.use(bodyParser.urlencoded({ extended: true, parameterLimit:500000 }));

app.use('/api', BaseRouter);

const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));
app.use(function(req:any, res:any, next:any) {
  req.io = io;
  next();
});
const server = require('http').createServer(app);
const options = { /* ... */ };
const io = require('socket.io')(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });
  app.io = io;
//@ts-ignore
io.on('connection', function(socket){
  console.log('a user connected');


  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

server.listen(5000);