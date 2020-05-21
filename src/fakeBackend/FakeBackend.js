import form from '../testTools/json/Form.json';
import loginform from '../testTools/json/LoginForm';

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
    if (type === 'form' && tags === 'nav-skjema') {
      return [form];
    }
    return [];
  }

  now() {
    return this.nowFunction()
  }
}