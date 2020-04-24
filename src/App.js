import React from 'react';
import './App.css';
import { Form, Components } from "react-formio";

import components from "./Custom";

Components.setComponents(components);



function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Form src="https://uejbftofvvvqmnb.form.io/forerhund" />
      </header>
    </div>
  );
}

export default App;
