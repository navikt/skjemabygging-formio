import {
  AttachmentSettingValues,
  AttachmentType,
  Component,
  ComponentValue,
  NavFormType,
  navFormUtils,
  Submission,
} from '@navikt/skjemadigitalisering-shared-domain';
import UtilsOverrides from '../../formio/overrides/utils-overrides/utils-overrides';

interface Attachment {
  navId?: string;
  vedleggsnr: string;
  tittel: string;
  label: string;
  beskrivelse: string;
  pakrevd: boolean;
  propertyNavn: string;
  formioId: string;
  vedleggskjema?: string;
  description?: string;
  values?: ComponentValue[];
  attachmentValues?: AttachmentSettingValues;
  attachmentType?: AttachmentType;
}

const getAttachment = (navId: string, form: NavFormType): Attachment | undefined => {
  return navFormUtils
    .flattenComponents(form.components)
    .filter((comp) => comp.type === 'attachment' && navFormUtils.getNavId(comp) === navId)
    .map(toAttachment)[0];
};

// TODO getAllAttachments should return Component[], not Attachment[]
const getAllAttachments = (form: NavFormType, submission: Submission): Attachment[] => {
  return navFormUtils
    .flattenComponents(form.components)
    .filter((component) => isAttachment(component) || isOtherDocumentation(component))
    .map(sanitize)
    .filter((comp) => UtilsOverrides.checkCondition(comp, undefined, submission?.data, form, undefined, submission))
    .map((comp) => {
      return {
        ...comp,
        navId: navFormUtils.getNavId(comp),
      };
    });
};

const getRelevantAttachments = (form: NavFormType, submission: Submission): Attachment[] => {
  return navFormUtils
    .flattenComponents(form.components)
    .filter((component) => isAttachment(component) && !isOtherDocumentation(component))
    .map(sanitize)
    .filter((comp) => UtilsOverrides.checkCondition(comp, undefined, submission?.data, form, undefined, submission))
    .map(toAttachment);
};

const toAttachment = (comp: Component): Attachment => {
  return {
    vedleggsnr: comp.properties!.vedleggskode!,
    tittel: comp.properties!.vedleggstittel!,
    label: comp.label,
    beskrivelse: comp.description!,
    pakrevd: true,
    propertyNavn: comp.key,
    vedleggskjema: comp.properties?.vedleggskjema,
    /* TODO: We should not use the native 'id' to identify the attachment, because it may change when the component changes.
     **   Note that a 'navId' is created when the component changes, but older forms doesn't have it yet.
     **   We should trigger a change on all attachment components to generate a navId,
     **   and then remove the code below that assigns comp.id to formioId (see task: https://trello.com/c/ok0YWpGI).
     */
    formioId: navFormUtils.getNavId(comp)!,
  };
};

const hasOtherDocumentation = (form, submission: Submission) => {
  return navFormUtils
    .flattenComponents(form.components)
    .map(sanitize)
    .filter((comp) => UtilsOverrides.checkCondition(comp, undefined, submission?.data, form, undefined, submission))
    .some((component) => isOtherDocumentation(component));
  // TODO: Remove otherDocumentation from component when all attachments have attachmentType set
};

const isAttachment = (component: Component): boolean => {
  return component.type === 'attachment';
};

const isOtherDocumentation = (component: Component): boolean => {
  return component.otherDocumentation || component.attachmentType === 'other';
};

const sanitize = (component) => {
  const clone = JSON.parse(JSON.stringify(component));
  clone.customConditional = UtilsOverrides.sanitizeJavaScriptCode(clone.customConditional);
  return clone;
};

const hasRelevantAttachments = (form: NavFormType, submission: Submission) => {
  return !!getRelevantAttachments(form, submission).length || hasOtherDocumentation(form, submission);
};

export {
  getAllAttachments,
  getAttachment,
  getRelevantAttachments,
  hasOtherDocumentation,
  hasRelevantAttachments,
  isOtherDocumentation,
};
export type { Attachment };
