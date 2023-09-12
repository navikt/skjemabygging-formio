import {
  dateUtils,
  FormPropertiesPublishing,
  FormPropertiesType,
  NavFormType,
  navFormUtils,
} from "@navikt/skjemadigitalisering-shared-domain";
import { fetchWithErrorHandling } from "../fetchUtils";

export class FormioService {
  private readonly projectUrl: string;

  constructor(projectUrl: string) {
    this.projectUrl = projectUrl;
  }

  async fetchFromProjectApi(path: string): Promise<any> {
    const response = await fetchWithErrorHandling(`${this.projectUrl}${path}`, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  }

  async getForm(formPath: string) {
    const formData: any = await this.fetchFromProjectApi(`/form?type=form&path=${formPath}&limit=1`);
    return formData[0];
  }

  async getForms(formPaths: string[], limit = 1000) {
    return this.fetchFromProjectApi(`/form?type=form&path__in=${formPaths.toString()}&limit=${limit}`);
  }

  async getPublishedForms(select = "", limit = 1000): Promise<NavFormType[]> {
    return this.fetchFromProjectApi(
      `/form?type=form&tags=nav-skjema&properties.published__exists=true&select=${select}&limit=${limit}`,
    );
  }

  async getUnpublishedForms(select = "", limit = 1000): Promise<NavFormType[]> {
    return this.fetchFromProjectApi(
      `/form?type=form&tags=nav-skjema&properties.unpublished__exists=true&select=${select}&limit=${limit}`,
    );
  }

  async getAllForms(limit = 1000, excludeDeleted = true, select = ""): Promise<NavFormType[]> {
    return this.fetchFromProjectApi(
      `/form?type=form${excludeDeleted ? "&tags=nav-skjema" : ""}&select=${select}&limit=${limit}`,
    );
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
    formProps: Partial<FormPropertiesType> = {},
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
    const formWithPropsAndNavid = addNavIdToComponents(formWithProps);
    const response: any = await fetchWithErrorHandling(`${updateFormUrl}/${form._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-jwt-token": formioToken,
      },
      body: JSON.stringify(formWithPropsAndNavid),
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
    }),
  );
};

const addNavIdToComponents = (form: NavFormType): NavFormType => ({
  ...form,
  components: navFormUtils.enrichComponentsWithNavIds(form.components)!,
});
