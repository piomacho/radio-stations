import React, { useState } from 'react'
import { AppWrapper } from './App.styles'
import SelectionPanel from './components/SelectionPanel/SelectionPanel'
import { BrowserRouter as Router } from 'react-router-dom'
import io from "socket.io-client";
import { useEffect } from 'react';
const ENDPOINT = "http://localhost:5000";

const socket = io('http://localhost:5000')

const App = () => {
  const [response, setResponse] = useState("");

  useEffect(() => {
    const socket = io(ENDPOINT);
    //@ts-ignore
    socket.on("FromAPI", data => {
      setResponse(data);
    });
  }, []);

    return (
      <Router>
        <AppWrapper>
        <p>
          It's <time dateTime={response}>{response}</time>
        </p>
          <SelectionPanel />
        </AppWrapper>
        </Router>
    )
}

export default App