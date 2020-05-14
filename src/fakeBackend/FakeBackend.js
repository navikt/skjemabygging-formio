import form from '../react-formio/json/Form.json';
import loginform from '../react-formio/json/LoginForm';

export class FakeBackend {
  constructor() {

  }
  setNowFunction(nowFunc) {
    this.nowFunction = nowFunc;
  }

  adminLoginForm() {
    return loginform;
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