import React, { useState, useEffect } from "react";
import "./App.css";
import { FormEdit, Components } from "react-formio";
import Formiojs from "formiojs/Formio";

import components from "./Custom";

Components.setComponents(components);

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
          options={{
            builder: {
              customFlesk: {
                title: 'Alfa komponenter',
                weight: 100,
                components: {
                  email: true,
                  phoneNumber: true
                }
              },
              customBasic: {
                title: 'Generiske komponenter',
                default: true,
                weight: 100,
                components: {
                  toggleCustomComp: true,
                  textfield: true,
                  textarea: true,
                  email: true,
                  phoneNumber: true
                }
              },
              basic: {
                title: 'Basiske snutter'
              },
              advanced: false
            }
          }}
          saveForm={onSave}
          saveText="LAGRE"
        />
      )}
    </div>
  );
}

export default App;
