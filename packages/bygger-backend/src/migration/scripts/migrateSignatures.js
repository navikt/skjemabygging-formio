import { generateDiff } from '../diffingTool';

function createNewSignatures(form) {
  const { hasLabeledSignatures, signatures } = form.properties;
  if (hasLabeledSignatures && signatures && signatures.signature1 !== '') {
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
  (editOptions, affectedComponentsLogger = []) =>
  (comp) => {
    const propertiesWithoutHasLabeledSignatures = Object.keys(comp.properties)
      .filter((key) => key !== 'hasLabeledSignatures')
      .flatMap((key) => ({ [key]: comp.properties[key] }));
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
