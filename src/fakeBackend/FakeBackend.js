import form from "../testTools/frontend/json/Form.json";
import columnForm from "../../example_data/columnsForm.json";
import loginform from "../testTools/frontend/json/LoginForm";

export class FakeBackend {
  constructor() {
    this.allForms = [form, columnForm];
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

  forms({ type }) {
    if (type === "form") {
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
    return this.allForms.some((each) => each.path === path);
  }

  formByPath(path) {
    return this.allForms.find((each) => each.path === path);
  }

  now() {
    return this.nowFunction();
  }
}
