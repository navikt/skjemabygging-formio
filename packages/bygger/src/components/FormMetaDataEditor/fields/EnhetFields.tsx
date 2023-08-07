import { useAppConfig } from "@navikt/skjemadigitalisering-shared-components";
import { NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import EnhetSettings from "../EnhetSettings";
import { UpdateFormFunction } from "../utils";

export interface EnhetFieldsProps {
  onChange: UpdateFormFunction;
  form: NavFormType;
}

const EnhetFields = ({ onChange, form }: EnhetFieldsProps) => {
  const { featureToggles } = useAppConfig();

  const innsending = form.properties.innsending || "PAPIR_OG_DIGITAL";
  const mottaksadresseId = form.properties.mottaksadresseId;
  const enhetMaVelgesVedPapirInnsending = form.properties.enhetMaVelgesVedPapirInnsending;
  const enhetstyper = form.properties.enhetstyper;

  return (
    <>
      {(innsending === "KUN_PAPIR" || innsending === "PAPIR_OG_DIGITAL") &&
        !mottaksadresseId &&
        featureToggles?.enableEnhetsListe && (
          <div className="mb">
            <EnhetSettings
              enhetMaVelges={!!enhetMaVelgesVedPapirInnsending}
              selectedEnhetstyper={enhetstyper}
              onChangeEnhetMaVelges={(selected) =>
                onChange({
                  ...form,
                  properties: {
                    ...form.properties,
                    enhetMaVelgesVedPapirInnsending: selected,
                    enhetstyper: selected ? form.properties.enhetstyper : undefined,
                  },
                })
              }
              onChangeEnhetstyper={(enhetstyper) =>
                onChange({ ...form, properties: { ...form.properties, enhetstyper } })
              }
            />
          </div>
        )}
    </>
  );
};

export default EnhetFields;
