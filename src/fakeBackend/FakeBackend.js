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

  forms({type, tags}) {
    console.log('got here', type, tags);
    if (type === 'form' && tags === 'nav-skjema') {
      return [form];
    }
    return [];
  }

  now() {
    return this.nowFunction()
  }
}