import { Component, NavFormType, Submission, Webform } from '@navikt/skjemadigitalisering-shared-domain';
import EventEmitter from 'eventemitter2';
import { Formio, Utils } from 'formiojs';
import { SANITIZE_CONFIG } from '../../formio/form-builder-options/sanitizeConfig';

interface CreateOptions {
  appConfig: any;
  language?: string;
  i18n?: any;
  sanitizeConfig?: any;
  events?: any;
  submission?: Submission;
  panelSlug?: string;
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

const prefillForm = (form?: NavFormType, prefillData?: any) => {
  if (form && prefillData && Object.keys(prefillData).length > 0) {
    const formCopy = JSON.parse(JSON.stringify(form));

    Utils.eachComponent(formCopy.components, (component: Component) => {
      if (component.prefillKey && prefillData[component.prefillKey]) {
        component.prefillValue = prefillData[component.prefillKey];
      }
    });

    return formCopy;
  }

  return form;
};

const NavFormHelper = {
  create,
  prefillForm,
};

export default NavFormHelper;
