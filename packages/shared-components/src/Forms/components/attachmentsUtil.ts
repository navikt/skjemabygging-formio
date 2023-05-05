import { navFormUtils } from "@navikt/skjemadigitalisering-shared-domain";
import FormioUtils from "formiojs/utils";
import { sanitizeJavaScriptCode } from "../../formio-overrides";

const getRelevantAttachments = (form, submission) => {
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
  clone.customConditional = sanitizeJavaScriptCode(clone.customConditional);
  return clone;
};

const hasRelevantAttachments = (form, submission) => {
  return !!getRelevantAttachments(form, submission).length || hasOtherDocumentation(form, submission);
};

export { getRelevantAttachments, hasOtherDocumentation, hasRelevantAttachments };
