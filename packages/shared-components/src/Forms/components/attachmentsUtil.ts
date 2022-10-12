import { navFormUtils } from "@navikt/skjemadigitalisering-shared-domain";
import FormioUtils from "formiojs/utils";
import { sanitizeJavaScriptCode } from "../../formio-overrides";

const getRelevantAttachments = (form, submission) => {
  const vedleggComponents = navFormUtils
    .flattenComponents(form.components)
    .filter((component) => component.properties && !!component.properties.vedleggskode)
    .map((component) => {
      const clone = JSON.parse(JSON.stringify(component));
      clone.customConditional = sanitizeJavaScriptCode(clone.customConditional);
      return clone;
    });

  return vedleggComponents
    .filter((comp) => FormioUtils.checkCondition(comp, undefined, submission, form))
    .map((comp) => ({
      vedleggsnr: comp.properties.vedleggskode,
      tittel: comp.properties.vedleggstittel,
      label: comp.label,
      beskrivelse: comp.description,
      pakrevd: comp.properties.vedleggErValgfritt !== "ja",
      propertyNavn: comp.key,
    }));
};

export { getRelevantAttachments };
