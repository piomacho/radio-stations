import React from 'react'
import { AppWrapper } from './App.styles'
import SelectionPanel from './components/SelectionPanel/SelectionPanel'
import { BrowserRouter as Router } from 'react-router-dom'

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