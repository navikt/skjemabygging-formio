import { Component, NavFormType, navFormUtils } from "@navikt/skjemadigitalisering-shared-domain";

enum DiffStatus {
  NEW = "NEW",
  DELETED = "DELETED",
  CHANGED = "CHANGED",
  UNCHANGED = "UNCHANGED",
}

type PropertyDiff = {
  id?: string;
  status: DiffStatus;
  before?: any;
  after?: any;
};

type DiffObject = {
  id?: string;
  status: DiffStatus;
  numberOfChanges?: number;
  diff?: PropertyDiff[];
  label?: string;
  propertyDiff?: PropertyDiff[];
};

const isJsonEqual = (originalJSON: any, newJSON: any) => JSON.stringify(originalJSON) === JSON.stringify(newJSON);

const findMissingComponents = (originalComponents: Component[], newComponents: Component[]) =>
  originalComponents.filter(
    (originalComponent) => !newComponents.some((newComponent) => newComponent.id === originalComponent.id)
  );

const findChangedComponents = (originalComponents: Component[], newComponents: Component[]) =>
  originalComponents.filter((originalComponent) =>
    newComponents.some(
      (newComponent) => newComponent.id === originalComponent.id && !isJsonEqual(originalComponent, newComponent)
    )
  );

const generateComponentDiff = (originalComponent: Component, newComponent: Component): PropertyDiff[] => {
  const allComponentProperties = [
    ...Object.keys(originalComponent),
    ...Object.keys(newComponent).filter(
      (key) => originalComponent[key as keyof typeof originalComponent] === undefined
    ),
  ];
  const changedProperties = allComponentProperties.filter(
    (property) =>
      !isJsonEqual(
        originalComponent[property as keyof typeof originalComponent],
        newComponent[property as keyof typeof newComponent]
      )
  );
  return changedProperties.map((property) => {
    const beforeValue = originalComponent[property as keyof typeof originalComponent];
    const afterValue = newComponent[property as keyof typeof newComponent];
    if (beforeValue === undefined) {
      return {
        id: property,
        status: DiffStatus.NEW,
        after: afterValue,
      };
    }
    if (afterValue === undefined) {
      return {
        id: property,
        status: DiffStatus.DELETED,
        before: beforeValue,
      };
    }
    if (property === "components") {
      return {
        id: property,
        status: DiffStatus.CHANGED,
        label: newComponent.title || originalComponent.title || newComponent.label || originalComponent.label,
      };
    }
    return {
      id: property,
      status: DiffStatus.CHANGED,
      before: beforeValue,
      after: afterValue,
      label: newComponent.title || originalComponent.title || newComponent.label || originalComponent.label,
    };
  });
};

const generateNavFormDiff = (originalForm: NavFormType, newForm: NavFormType): DiffObject => {
  if (!originalForm?.components) {
    console.log("Original form is missing", originalForm);
  }
  if (!newForm?.components) {
    console.log("New form is missing", newForm);
  }
  if (isJsonEqual(originalForm, newForm)) {
    return {
      status: DiffStatus.UNCHANGED,
      id: originalForm._id,
    };
  }

  const diff: DiffObject[] = [];

  const allComponentsInOriginalForm = navFormUtils.flattenComponents(originalForm.components);
  const allComponentsInNewForm = navFormUtils.flattenComponents(newForm.components);

  const deletedComponents = findMissingComponents(allComponentsInOriginalForm, allComponentsInNewForm);
  const newComponents = findMissingComponents(allComponentsInNewForm, allComponentsInOriginalForm);
  const changedComponents = findChangedComponents(allComponentsInOriginalForm, allComponentsInNewForm);

  deletedComponents.forEach((deletedComponent) => {
    diff.push({
      id: deletedComponent.id,
      status: DiffStatus.DELETED,
    });
    // TODO: Update parent component to mark it as changed and add the deleted component as a diff
  });

  newComponents.forEach((newComponent) => {
    diff.push({
      id: newComponent.id,
      status: DiffStatus.NEW,
      label: newComponent.label,
    });
    // TODO: Update parent component to mark it as changed and add the new component as a diff
  });

  changedComponents.forEach((changedComponent) => {
    const componentDiff = generateComponentDiff(
      changedComponent,
      allComponentsInNewForm.find((comp: Component) => comp.id === changedComponent.id)
    );
    diff.push({
      id: changedComponent.id,
      status: DiffStatus.CHANGED,
      numberOfChanges: componentDiff.length,
      diff: componentDiff,
    });
  });

  const propertyDiff = generateComponentDiff(originalForm, newForm);
  //console.log("Form diff", JSON.stringify(propertyDiff, null, 2));

  return {
    status: DiffStatus.CHANGED,
    diff,
    propertyDiff,
  };

  // TODO: Should maybe put diffed components as map instead of array?
};

export { generateNavFormDiff, DiffStatus };
export type { DiffObject };
