import { NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import config from "../config";
import { fetchWithErrorHandling } from "../fetchUtils";

class FormioService {
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
    return fetchWithErrorHandling(currentUserUrl, {
      headers: {
        "Content-Type": "application/json",
        "x-jwt-token": userToken,
      },
    });
  }

  async updateForms(userToken: string, forms: NavFormType[]) {
    const updateFormUrl = `${this.projectUrl}/form`;
    return await Promise.all(
      forms.map((form) => {
        return fetchWithErrorHandling(`${updateFormUrl}/${form._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-jwt-token": userToken,
          },
          body: JSON.stringify(form),
        }).then((migratedForm) => migratedForm.data);
      })
    );
  }
}

const formioService = new FormioService(config.formio.projectUrl);

export default formioService;
