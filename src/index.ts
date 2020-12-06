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
const server = require('http').createServer(app);
const options = { /* ... */ };
const io = require('socket.io')(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"]
    }
  });


    //@ts-ignore
let interval;
    //@ts-ignore
io.on('connection', socket => {
    console.log("New client connected");
    //@ts-ignore
    if (interval) {
        //@ts-ignore
      clearInterval(interval);
    }
    interval = setInterval(() => getApiAndEmit(socket), 1000);
    socket.on("disconnect", () => {
      console.log("Client disconnected");
      //@ts-ignore
      clearInterval(interval);
    });
  });
  //@ts-ignore
  const getApiAndEmit = socket => {
    const response = new Date();
    // Emitting a new message. Will be consumed by the client
    socket.emit("FromAPI", response);
  };

server.listen(5000);
