import form from '../testTools/frontend/json/Form.json';
import loginform from '../testTools/frontend/json/LoginForm';

export class FakeBackend {
  constructor() {
    this.allForms = [form];
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
      return this.allForms;
    }
    return [];
  }

  addForm(form) {
    // add props and forth here
    this.allForms.push(form);
    return form;
  }

  hasFormByPath(path) {
    return this.allForms.some(each => each.path === path);
  }

  formByPath(path) {
    return this.allForms.find(each => each.path === path);
  }

  now() {
    return this.nowFunction()
  }
}
