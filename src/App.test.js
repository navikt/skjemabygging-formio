import React from 'react';
import { render } from '@testing-library/react';
import App from './App';
import {BrowserRouter} from "react-router-dom";

const fisk = {_id: 'fisk', title: 'fisk'};
const flesk = {_id: 'flesk', title: 'flesk'};

test('renders learn react link', () => {
  const { getByText } = render(<BrowserRouter><App forms={[fisk, flesk]} /></BrowserRouter>);
  const linkElement = getByText(/Velg et skjema/i);
  expect(linkElement).toBeInTheDocument();
});
