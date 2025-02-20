import { Component, NavFormType, Webform } from '@navikt/skjemadigitalisering-shared-domain';
import EventEmitter from 'eventemitter2';
import { Formio, Utils } from 'formiojs';
import { SANITIZE_CONFIG } from '../../formio/form-builder-options/sanitizeConfig';

interface CreateOptions {
  appConfig: any;
  language?: string;
  i18n?: any;
  sanitizeConfig?: any;
  events?: any;
}

const create = async (
  element: HTMLElement,
  srcOrForm: string | NavFormType,
  options: CreateOptions,
): Promise<Webform> => {
  const formPromise = await Formio.createForm(element, srcOrForm, {
    language: 'nb-NO',
    i18n: {},
    sanitizeConfig: SANITIZE_CONFIG,
    events: new EventEmitter({
      wildcard: false,
      maxListeners: 0,
    }),
    ...options,
  });

  await formPromise.ready;

  return formPromise;
};

const prefillForm = (form: Webform, prefillData: any) => {
  if (form?.form && prefillData && Object.keys(prefillData).length > 0) {
    const formCopy = JSON.parse(JSON.stringify(form.form));

    Utils.eachComponent(formCopy.components, (component: Component) => {
      if (component.prefillKey && prefillData[component.prefillKey]) {
        component.prefillValue = prefillData[component.prefillKey];
      }
    });

    form.form = formCopy;
  }
};

const NavFormBuilder = {
  create,
  prefillForm,
};

export default NavFormBuilder;
