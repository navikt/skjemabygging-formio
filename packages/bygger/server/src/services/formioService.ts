import {
  dateUtils,
  FormPropertiesPublishing,
  FormPropertiesType,
  NavFormType,
} from "@navikt/skjemadigitalisering-shared-domain";
import config from "../config";
import { fetchWithErrorHandling } from "../fetchUtils";

export class FormioService {
  private readonly projectUrl: string;

  constructor(projectUrl: string) {
    this.projectUrl = projectUrl;
  }

  async fetchFromProjectApi(path: string) {
    const response = await fetchWithErrorHandling(`${this.projectUrl}${path}`, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  }

  async getForm(formPath: string) {
    const formData = await this.fetchFromProjectApi(`/form?type=form&path=${formPath}&limit=1`);
    return formData[0];
  }

  async getForms(formPaths: string[], limit = 1000) {
    return this.fetchFromProjectApi(`/form?type=form&path__in=${formPaths.toString()}&limit=${limit}`);
  }

  async getAllForms(limit = 1000, excludeDeleted = true) {
    return this.fetchFromProjectApi(`/form?type=form${excludeDeleted ? "&tags=nav-skjema" : ""}&limit=${limit}`);
  }

  async getFormioUser(userToken: string) {
    const currentUserUrl = `${this.projectUrl}/current`;
    const response = await fetchWithErrorHandling(currentUserUrl, {
      headers: {
        "Content-Type": "application/json",
        "x-jwt-token": userToken,
      },
    });
    return response.data;
  }

  async saveForm(
    form: NavFormType,
    formioToken: string,
    userName: string,
    formProps: Partial<FormPropertiesType> = {}
  ): Promise<NavFormType> {
    const updateFormUrl = `${this.projectUrl}/form`;
    const props = { ...formProps };
    if (!props.modified) {
      props.modified = dateUtils.getIso8601String();
    }
    if (!props.modifiedBy) {
      props.modifiedBy = userName;
    }
    const formWithProps = updateProps(form, props);
    const response = await fetchWithErrorHandling(`${updateFormUrl}/${form._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-jwt-token": formioToken,
      },
      body: JSON.stringify(formWithProps),
    });
    return response.data;
  }

  async saveForms(forms: NavFormType[], formioToken: string, userName: string): Promise<NavFormType[]> {
    const now = dateUtils.getIso8601String();
    const formProps: FormPropertiesPublishing = {
      modified: now,
      modifiedBy: userName,
    };
    return await Promise.all(forms.map((form) => this.saveForm(form, formioToken, userName, formProps)));
  }
}

const updateProps = (form: NavFormType, props: Partial<FormPropertiesType>): NavFormType => {
  return JSON.parse(
    JSON.stringify({
      ...form,
      properties: {
        ...form.properties,
        ...props,
      },
    })
  );
};

const formioService = new FormioService(config.formio.projectUrl);

export default formioService;
