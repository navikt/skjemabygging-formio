import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Form, Components } from "react-formio";

import components from "./Custom";

Components.setComponents(components);



function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Form src="http://localhost:3001/forerhund/" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
