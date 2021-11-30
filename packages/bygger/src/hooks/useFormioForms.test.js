import React from "react";
import { render, screen } from "@testing-library/react";
import fetchMock from "jest-fetch-mock";
import {useFormioForms} from "./useFormioForms";
import Formiojs from "formiojs/Formio";

const RESPONSE_HEADERS = {
  headers: {
    "content-type": "application/json"
  }
};

describe('useFormioForms', () => {

  const TestComponent = ({}) => {
    const {forms} = useFormioForms(new Formiojs("http://myproject.example.org"));
    return <div>Antall skjema: {forms ? forms.length : 0}</div>;
  }

  it("loads all forms in the hook", async () => {
    fetchMock.mockImplementation((url) => {
      if (url.endsWith("/form?type=form&tags=nav-skjema&limit=1000")) {
        const forms = [
          {title: "skjema1"},
          {title: "skjema2"},
          {title: "skjema3"},
        ];
        return Promise.resolve(new Response(JSON.stringify(forms), RESPONSE_HEADERS));
      }
      return Promise.reject(new Error(`ukjent url ${url}`));
    });
    render(<TestComponent />);
    expect(await screen.findByText("Antall skjema: 3")).toBeInTheDocument();
  });

});
