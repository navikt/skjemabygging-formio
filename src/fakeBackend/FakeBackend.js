import form from '../react-formio/Form.json';

export class FakeBackend {
  constructor() {

  }
  setNowFunction(nowFunc) {
    this.nowFunction = nowFunc;
  }

  form() {
    return form;
  }

  now() {
    return this.nowFunction()
  }
}