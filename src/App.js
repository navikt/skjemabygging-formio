import React, { useState, useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import { FormEdit } from "react-formio";
import Formiojs from "formiojs/Formio";

function App() {
  const path = `http://localhost:3001/forerhund`;
  const formio = new Formiojs(path);

  const [form, setForm] = useState();

  useEffect(() => {
    // Update the document title using the browser API
    formio.loadForm().then(form => setForm(form));
  }, [formio]);

  return (
    <div className="App">
      {form && (
        <FormEdit
          options={{ src: "http://localhost:3001/forerhund" }}
          form={form}
        />
      )}
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
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
