import React, { useState, useEffect } from "react";
import "./App.css";
import { FormEdit } from "react-formio";
import Formiojs from "formiojs/Formio";

function App() {
  const path = `http://localhost:3001/forerhund`;
  const formio = new Formiojs(path);

  const [form, setForm] = useState();

  useEffect(() => {
    formio.loadForm().then(form => setForm(form));
  }, []);

  const onSave = form =>
    formio.saveForm(form).then(changedForm => setForm(changedForm));

  return (
    <div className="App">
      {form && (
        <FormEdit
          options={{ src: "http://localhost:3001/forerhund" }}
          form={form}
          saveForm={onSave}
          saveText="LAGRE"
        />
      )}
    </div>
  );
}

export default App;
