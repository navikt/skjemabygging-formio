import {
  dateUtils,
  FormioTranslationPayload,
  FormPropertiesPublishing,
  FormPropertiesType,
  NavFormType,
  navFormUtils,
} from '@navikt/skjemadigitalisering-shared-domain';
import { fetchWithErrorHandling } from '../fetchUtils';
import { logger } from '../logging/logger';

export class FormioService {
  public readonly projectUrl: string;

  constructor(projectUrl: string) {
    this.projectUrl = projectUrl;
  }

  async fetchFromProjectApi<T>(path: string): Promise<T> {
    const response = await fetchWithErrorHandling(`${this.projectUrl}${path}`, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data as T;
  }

  async getForm(formPath: string, type: string = 'form') {
    const formData = await this.fetchFromProjectApi<NavFormType[]>(`/form?type=${type}&path=${formPath}&limit=1`);
    return formData[0];
  }

  async getForms(formPaths: string[], limit = 1000) {
    return this.fetchFromProjectApi<NavFormType[]>(`/form?type=form&path__in=${formPaths.toString()}&limit=${limit}`);
  }

  async getPublishedForms(select = '', limit = 1000): Promise<NavFormType[]> {
    return this.fetchFromProjectApi(
      `/form?type=form&tags=nav-skjema&properties.published__exists=true&select=${select}&limit=${limit}`,
    );
  }

  async getUnpublishedForms(select = '', limit = 1000): Promise<NavFormType[]> {
    return this.fetchFromProjectApi(
      `/form?type=form&tags=nav-skjema&properties.unpublished__exists=true&select=${select}&limit=${limit}`,
    );
  }

  async getAllForms(limit = 1000, excludeDeleted = true, select = ''): Promise<NavFormType[]> {
    return this.fetchFromProjectApi(
      `/form?type=form${excludeDeleted ? '&tags=nav-skjema' : ''}&select=${select}&limit=${limit}`,
    );
  }

  async getTranslations(formPath: string) {
    return this.fetchFromProjectApi<FormioTranslationPayload[]>(
      `/language/submission?data.name__regex=/^global\\.${formPath}$/gi&limit=1000`,
    );
  }

  async saveTranslation(resource: FormioTranslationPayload, userToken: string) {
    const translationId = resource._id;
    const response = await fetchWithErrorHandling(
      `${this.projectUrl}/language/submission${translationId ? `/${translationId}` : ''}`,
      {
        method: translationId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-jwt-token': userToken,
        },
        body: JSON.stringify(resource),
      },
    );
    return response.data as FormioTranslationPayload;
  }

  async saveTranslations(translations: FormioTranslationPayload[], userToken: string) {
    return await Promise.all(translations.map((t) => this.saveTranslation(t, userToken)));
  }

  async deleteTranslation(translationId: string, userToken: string) {
    await fetchWithErrorHandling(`${this.projectUrl}/language/submission/${translationId}`, {
      method: 'DELETE',
      headers: {
        'x-jwt-token': userToken,
      },
    });
    return translationId;
  }

  async deleteTranslations(formPath: string, userToken: string) {
    const translations = await this.getTranslations(formPath);
    if (translations.length > 0) {
      logger.debug(`Will delete all translations for form ${formPath}`, {
        translationIds: translations.map((t) => t._id),
      });
      await Promise.all(translations.map((t) => this.deleteTranslation(t._id, userToken)));
    } else {
      logger.debug(`No translations to delete for form ${formPath}`);
    }
  }

  async getFormioUser(userToken: string) {
    const currentUserUrl = `${this.projectUrl}/current`;
    const response = await fetchWithErrorHandling(currentUserUrl, {
      headers: {
        'Content-Type': 'application/json',
        'x-jwt-token': userToken,
      },
    });
    return response.data;
  }

  async saveForm(
    form: NavFormType,
    formioToken: string,
    userName: string,
    formProps: Partial<FormPropertiesType> = {},
    enrichComponents: boolean = false,
  ): Promise<NavFormType> {
    const updateFormUrl = `${this.projectUrl}/form`;
    const props = { ...formProps };
    if (!props.modified) {
      props.modified = dateUtils.getIso8601String();
    }
    if (!props.modifiedBy) {
      props.modifiedBy = userName;
    }
    const enrichedForm = enrichComponents ? addNavIdToComponents(form) : form;
    const formWithProps = updateProps(enrichedForm, props);
    const response: any = await fetchWithErrorHandling(`${updateFormUrl}/${form._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-jwt-token': formioToken,
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
    }),
  );
};

const addNavIdToComponents = (form: NavFormType): NavFormType => ({
  ...form,
  components: navFormUtils.enrichComponentsWithNavIds(form.components)!,
});
