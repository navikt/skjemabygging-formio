import {FakeBackendTestContext} from "./FakeBackendTestContext";
import {Formio} from "formiojs";
import React from 'react';
import App from "./App";
import {MemoryRouter} from "react-router-dom";

const context = new FakeBackendTestContext();
context.setupBeforeAfter();

describe('App', () => {
  let oldFormioFetch;
  beforeEach(() => {
    oldFormioFetch = Formio.fetch;
    Formio.fetch = global.fetch;
  });
  afterEach(() => {
    Formio.fetch = oldFormioFetch;
  });

  it('loads all the forms using REST', async () => {
    context.render(<MemoryRouter initialEntries={["/"]}>
      <App projectURL="http://myproject.example.org/"></App>
    </MemoryRouter>);
    console.log(context.testRenderer.toJSON());
    const linkList = await context.waitForComponent('ul');
    expect(linkList.props.children).toHaveLength(7);
  });

  it('loads the form in the hook', () => {

  });
});
