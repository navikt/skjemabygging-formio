import { generateDiff } from '../diffingTool';

type LegacySignatureMap = Record<string, string>;

type SignatureEntry = {
  label: string;
  description?: string;
};

type MigratableForm = {
  properties: Record<string, unknown> & {
    hasLabeledSignatures?: boolean;
    signatures?: LegacySignatureMap | SignatureEntry[];
  };
};

type AffectedComponentLog = {
  original: MigratableForm;
  new: MigratableForm;
  changed: boolean;
  diff: ReturnType<typeof generateDiff>;
};

function createNewSignatures(form: MigratableForm): SignatureEntry[] {
  const { hasLabeledSignatures, signatures } = form.properties;
  if (hasLabeledSignatures && signatures && !Array.isArray(signatures) && signatures.signature1 !== '') {
    return Object.keys(signatures)
      .filter((key) => key.match(/^signature\d$/))
      .sort()
      .flatMap((signature) => {
        const label = signatures[signature];
        const description = signatures[`${signature}Description`];
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
        label: '',
        description: '',
      },
    ];
  }
}

const migrateSignatures =
  (_editOptions: unknown, affectedComponentsLogger: AffectedComponentLog[] = []) =>
  (comp: MigratableForm): MigratableForm => {
    const propertiesWithoutHasLabeledSignatures = Object.fromEntries(
      Object.entries(comp.properties).filter(([key]) => key !== 'hasLabeledSignatures'),
    );
    const editedComp = {
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
