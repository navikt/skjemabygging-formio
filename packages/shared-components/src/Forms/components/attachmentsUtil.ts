import { navFormUtils } from "@navikt/skjemadigitalisering-shared-domain";
import FormioUtils from "formiojs/utils/utils";
import UtilsOverrides from "../../formio-overrides/utils-overrides";

interface Attachment {
  vedleggsnr: string;
  tittel: string;
  label: string;
  beskrivelse: string;
  pakrevd: boolean;
  propertyNavn: string;
  formioId: string;
}

const getRelevantAttachments = (form, submission): Attachment[] => {
  return navFormUtils
    .flattenComponents(form.components)
    .filter((component) => component.properties && !!component.properties.vedleggskode && !component.otherDocumentation)
    .map(sanitize)
    .filter((comp) => FormioUtils.checkCondition(comp, undefined, submission.data, form))
    .map((comp) => ({
      vedleggsnr: comp.properties.vedleggskode,
      tittel: comp.properties.vedleggstittel,
      label: comp.label,
      beskrivelse: comp.description,
      pakrevd: comp.properties.vedleggErValgfritt !== "ja",
      propertyNavn: comp.key,
      /* TODO: We should not use the native 'id' to identify the attachment, because it may change when the component changes.
       **   Note that a 'navId' is created when the component changes, but older forms doesn't have it yet.
       **   We should trigger a change on all attachment components to generate a navId,
       **   and then remove the code below that assigns comp.id to formioId (see task: https://trello.com/c/ok0YWpGI).
       */
      formioId: comp.navId ?? comp.id,
    }));
};

const hasOtherDocumentation = (form, submission) => {
  return navFormUtils
    .flattenComponents(form.components)
    .map(sanitize)
    .filter((comp) => FormioUtils.checkCondition(comp, undefined, submission.data, form))
    .some((component) => component.otherDocumentation);
};

const sanitize = (component) => {
  const clone = JSON.parse(JSON.stringify(component));
  clone.customConditional = UtilsOverrides.sanitizeJavaScriptCode(clone.customConditional);
  return clone;
};

const hasRelevantAttachments = (form, submission) => {
  return !!getRelevantAttachments(form, submission).length || hasOtherDocumentation(form, submission);
};

export type { Attachment };
export { getRelevantAttachments, hasOtherDocumentation, hasRelevantAttachments };
