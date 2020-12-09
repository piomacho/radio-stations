import React, { useState } from 'react'
import { AppWrapper } from './App.styles'
import SelectionPanel from './components/SelectionPanel/SelectionPanel'
import { BrowserRouter as Router } from 'react-router-dom'
import io from "socket.io-client";
import { useEffect } from 'react';
const ENDPOINT = "http://localhost:5000";

const socket = io('http://localhost:5000')

const App = () => {
    return (
      <Router>
        <AppWrapper>
          <SelectionPanel />
        </AppWrapper>
        </Router>
    )
}

export default App