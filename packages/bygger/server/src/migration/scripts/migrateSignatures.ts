import { FormPropertiesType, FormSignaturesType, NavFormType } from "@navikt/skjemadigitalisering-shared-domain";
import { generateDiff } from "../diffingTool";

type AffectedComponentsLog = {
  original: NavFormType;
  new: NewNavFormType;
  changed: boolean;
  diff: string;
};

type Signature = {
  label?: string;
  description?: string;
};

interface NewFormPropertiesType extends Omit<FormPropertiesType, "signatures" | "hasLabeledSignatures"> {
  signatures: Signature[];
}

interface NewNavFormType extends Omit<NavFormType, "properties"> {
  properties: NewFormPropertiesType;
}

function createNewSignatures(form: NavFormType): Signature[] {
  const { hasLabeledSignatures, signatures } = form.properties;
  if (hasLabeledSignatures && signatures && signatures.signature1 !== "") {
    return Object.keys(signatures)
      .filter((key) => key.match(/^signature\d$/))
      .sort()
      .flatMap((signature) => {
        const label = signatures[signature as keyof FormSignaturesType];
        const description = signatures[`${signature}Description` as keyof FormSignaturesType];
        if (label) {
          return [
            {
              label,
              description,
            },
          ];
        } else {
          return [];
        }
      });
  } else {
    return [
      {
        label: "",
        description: "",
      },
    ];
  }
}

const migrateSignatures =
  (editOptions: Object, affectedComponentsLogger: AffectedComponentsLog[] = []) =>
  (comp: NavFormType) => {
    const propertiesWithoutHasLabeledSignatures = Object.keys(comp.properties)
      .filter((key) => key !== "hasLabeledSignatures")
      .flatMap((key) => ({ [key]: comp.properties[key as keyof FormPropertiesType] }));
    const editedComp: NewNavFormType = {
      ...comp,
      properties: {
        ...propertiesWithoutHasLabeledSignatures,
        signatures: createNewSignatures(comp),
      },
    };
    const changed = true;
    const diff = changed && generateDiff(comp, editedComp);
    affectedComponentsLogger.push({ original: comp, new: editedComp, changed, diff });
    return editedComp;
  };

export default migrateSignatures;
