import {
  AttachmentSettingValues,
  Component,
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
  attachmentValues?: AttachmentSettingValues;
  attachmentType?: string;
}

const getAttachment = (navId: string, form: NavFormType): Attachment | undefined => {
  return navFormUtils
    .flattenComponents(form.components)
    .filter((comp) => comp.type === 'attachment' && (comp as Component).navId === navId)
    .map(toAttachment)[0];
};

// TODO getAllAttachments should return Component[], not Attachment[]
const getAllAttachments = (form: NavFormType, submission: Submission): Attachment[] => {
  return navFormUtils
    .flattenComponents(form.components)
    .filter(
      (component) => (component.properties && !!component.properties.vedleggskode) || isOtherDocumentation(component),
    )
    .map(sanitize)
    .filter((comp) => UtilsOverrides.checkCondition(comp, undefined, submission?.data, form, undefined, submission))
    .map((comp) => {
      return {
        ...comp,
        navId: comp.navId || comp.id,
      };
    });
};

const getRelevantAttachments = (form: NavFormType, submission: Submission): Attachment[] => {
  return navFormUtils
    .flattenComponents(form.components)
    .filter(
      (component) => component.properties && !!component.properties.vedleggskode && !isOtherDocumentation(component),
    )
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
    formioId: (comp.navId ?? comp.id)!,
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
