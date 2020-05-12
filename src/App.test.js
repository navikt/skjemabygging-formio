import {FakeBackendTestContext} from "./FakeBackendTestContext";
import {Formio} from "formiojs";
import React from 'react';
import App, {useFormio} from "./App";
import {MemoryRouter} from "react-router-dom";
import { renderHook, act } from '@testing-library/react-hooks'
import form from './react-formio/Form.json';

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

  it('loads the form in the hook', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useFormio('http://myproject.example.org'));
    expect(result.current.authenticated).toBeFalsy();
    act(() => {
      result.current.setAuthenticated(true)
    });
    expect(result.current.authenticated).toBeTruthy();
    await waitForNextUpdate();
    expect(result.current.forms).toEqual([form]);
  });
});
