import { Component, NavFormType, SubmissionData, navFormUtils } from '@navikt/skjemadigitalisering-shared-domain';
import FormioUtils from 'formiojs/utils';
import UtilsOverrides from '../../formio/overrides/utils-overrides/utils-overrides';

interface Attachment {
  vedleggsnr: string;
  tittel: string;
  label: string;
  beskrivelse: string;
  pakrevd: boolean;
  propertyNavn: string;
  formioId: string;
  vedleggskjema?: string;
}

const getRelevantAttachments = (form: NavFormType, submissionData: SubmissionData): Attachment[] => {
  return navFormUtils
    .flattenComponents(form.components)
    .filter(
      (component) => component.properties && !!component.properties.vedleggskode && !isOtherDocumentation(component),
    )
    .map(sanitize)
    .filter((comp) => FormioUtils.checkCondition(comp, undefined, submissionData, form))
    .map((comp) => ({
      vedleggsnr: comp.properties.vedleggskode,
      tittel: comp.properties.vedleggstittel,
      label: comp.label,
      beskrivelse: comp.description,
      pakrevd: true,
      propertyNavn: comp.key,
      vedleggskjema: comp.properties.vedleggskjema,
      /* TODO: We should not use the native 'id' to identify the attachment, because it may change when the component changes.
       **   Note that a 'navId' is created when the component changes, but older forms doesn't have it yet.
       **   We should trigger a change on all attachment components to generate a navId,
       **   and then remove the code below that assigns comp.id to formioId (see task: https://trello.com/c/ok0YWpGI).
       */
      formioId: comp.navId ?? comp.id,
    }));
};

const hasOtherDocumentation = (form, submissionData) => {
  return navFormUtils
    .flattenComponents(form.components)
    .map(sanitize)
    .filter((comp) => FormioUtils.checkCondition(comp, undefined, submissionData, form))
    .some((component) => isOtherDocumentation(component));
  // TODO: Remove otherDocumentation from component when all attachments have attachmentType set
};

const isOtherDocumentation = (component: Component): boolean => {
  return component.otherDocumentation || component.attachmentType === 'other';
};

const sanitize = (component) => {
  const clone = JSON.parse(JSON.stringify(component));
  clone.customConditional = UtilsOverrides.sanitizeJavaScriptCode(clone.customConditional);
  return clone;
};

const hasRelevantAttachments = (form, submissionData) => {
  return !!getRelevantAttachments(form, submissionData).length || hasOtherDocumentation(form, submissionData);
};

export { getRelevantAttachments, hasOtherDocumentation, hasRelevantAttachments };
export type { Attachment };
