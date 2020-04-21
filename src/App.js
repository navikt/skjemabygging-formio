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

  const dummyUser = {
    data: { email: "admin@example.com", password: "CHANGEME", submit: true },
    metadata: {
      timezone: "Europe/Oslo",
      offset: 120,
      referrer: "",
      browserName: "Netscape",
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.92 Safari/537.36",
      pathName: "/",
      onLine: true
    },
    state: "submitted"
  };

  useEffect(() => {
    async function login(data = {}) {
      return await fetch("http://localhost:3001/user/login/submission?live=1", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
    }

    login(dummyUser)
      .then(response => {
        Formiojs.setToken(response.headers.get("x-jwt-token"));
        return response.json();
      })
      .then(user => Formiojs.setUser(user));

    formio.loadForm().then(form => setForm(form));
  }, []);

  const onSave = form =>
    formio.saveForm(form).then(changedForm => setForm(changedForm));

  console.log(Formiojs.getToken());
  return (
    <div className="App">
      {form && (
        <FormEdit
          form={form}
          options={{
            src: "http://localhost:3001/forerhund",
            builder: {
              customFlesk: {
                title: "Alfa komponenter",
                weight: 100,
                components: {
                  email: true,
                  phoneNumber: true
                }
              },
              customBasic: {
                title: "Generiske komponenter",
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
                title: "Basiske snutter"
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
