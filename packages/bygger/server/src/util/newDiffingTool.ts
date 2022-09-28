import { NavFormType } from "@navikt/skjemadigitalisering-shared-domain";

enum DiffStatus {
  NEW = "NEW",
  DELETED = "DELETED",
  CHANGED = "CHANGED",
  UNCHANGED = "UNCHANGED",
}

type PropertyDiff = {
  [key: string]: {
    before: any;
    after: any;
  };
};

type DiffObject = {
  id?: string;
  status: DiffStatus;
  numberOfChanges?: number;
  diff?: PropertyDiff[];
};

const generateNavFormDiff = (originalForm: NavFormType, newForm: NavFormType) => {
  return generateDiff(originalForm, newForm);
};

/*const generateFormOrComponentDiff = (originalElement: any, newElement: any, combinedDiff: DiffObject[] = []) => {
  const diffForCurrentElement = generateDiff(originalElement, newElement, { status: DiffStatus.UNCHANGED });
  if (diffForCurrentElement.status !== DiffStatus.UNCHANGED) {
    combinedDiff.push(diffForCurrentElement);
  }
  if (originalElement.components || newElement.components) {
    const subComponentsDiff = generateSubComponentsDiff(originalElement.components, newElement.components);
    if (!isEmptyArray(subComponentsDiff)) {
      return [...combinedDiff, ...subComponentsDiff];
    }
  }
  return combinedDiff;
};

const generateSubComponentsDiff = (originalComponents: any[], newComponents: any[]): DiffObject[] => {
  if (isEmptyArray(originalComponents) && isEmptyArray(newComponents)) {
    return [];
  }
  return newComponents.map((value, newIndex) => {
    const originalIndex = originalComponents.findIndex((v) => v.id === value.id);
    if (originalIndex === -1) {
      return generateDiff(undefined, value);
    } else {
      // TODO: Add originalIndex somehow
      return generateDiff(originalComponents[originalIndex], value);
    }
  });
};*/

const generateDiff = (originalElement: any, newElement: any): DiffObject => {
  console.log("originalElement", JSON.stringify(originalElement, null, 2));
  console.log("newElement", JSON.stringify(newElement, null, 2));

  if (JSON.stringify(originalElement) !== JSON.stringify(newElement)) {
    if (isArray(originalElement) || isArray(newElement)) {
      return generateArrayDiff(originalElement, newElement);
    } else if (isObject(originalElement) || isObject(newElement)) {
      return generateObjectDiff(originalElement, newElement);
    } else {
      return generatePrimitiveDiff(originalElement, newElement);
    }
  } else {
    return {
      status: DiffStatus.UNCHANGED,
    };
  }
};

const generatePrimitiveDiff = (originalElement: any, newElement: any) => {
  if (isNullOrUndefined(originalElement)) {
    return {
      status: DiffStatus.NEW,
    };
  }

  if (isNullOrUndefined(newElement)) {
    return {
      status: DiffStatus.DELETED,
    };
  }

  return {
    status: DiffStatus.CHANGED,
  };
};

const generateArrayDiff = (originalArray: any[], newArray: any[]): DiffObject => {
  if (isEmptyArray(originalArray) && isEmptyArray(newArray)) {
    return {
      status: DiffStatus.UNCHANGED,
    };
  }

  if (isEmptyArray(originalArray)) {
    return {
      status: DiffStatus.NEW,
    };
  }

  if (isEmptyArray(newArray)) {
    return {
      status: DiffStatus.DELETED,
    };
  }

  return {
    status: DiffStatus.CHANGED,
  };
};

const generateObjectDiff = (originalObject: any, newObject: any): DiffObject => {
  if (isEmptyObject(originalObject)) {
    return {
      status: DiffStatus.NEW,
    };
  }

  if (isEmptyObject(newObject)) {
    return {
      status: DiffStatus.DELETED,
    };
  }
  const result: DiffObject = {
    id: originalObject.id || newObject.id,
    status: DiffStatus.CHANGED,
    diff: [],
  };
  const allPropertyNames = Object.keys({ ...originalObject, ...newObject });
  const hasSubComponents = allPropertyNames.includes("components");

  if (hasSubComponents) {
    //result.diff = [generateDiff(originalObject.components, newObject.components)];
    allPropertyNames.splice(allPropertyNames.indexOf("components", 1)); // Remove components from properties to diff, since it has been handled;
  }

  return result;
};

const isNullOrUndefined = (element: any) => {
  return element === null || typeof element === "undefined";
};

const isEmptyObject = (obj: any) => {
  return isNullOrUndefined(obj) || Object.keys(obj).length === 0;
};

const isEmptyArray = (arr: any) => {
  return isNullOrUndefined(arr) || arr.length === 0;
};

const isArray = (element: any) => {
  return Array.isArray(element);
};

/*const isArrayWithElements = (element: any) => {
  return isArray(element) && !isEmptyArray(element);
};*/

const isObject = (element: any) => {
  // Array is also an object in js, but we only want actual objects.
  return typeof element === "object" && !Array.isArray(element);
};

export { generateNavFormDiff, generateDiff, DiffStatus };
