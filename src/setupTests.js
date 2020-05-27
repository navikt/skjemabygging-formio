// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

import waitForExpect from 'wait-for-expect';

waitForExpect.defaults.timeout = 4500;
// waitForExpect.defaults.interval = 10;