import { Component, NavFormType } from "../form";
import { navFormUtils } from "../index";

enum DiffStatus {
  NEW = "Ny",
  DELETED = "Slettet",
  CHANGED = "Endring",
}

const generateNavFormDiff = (originalForm: NavFormType, newForm: NavFormType) => {
  return generateFormDiff(originalForm, newForm);
};

const checkComponentDiff = (currentComponent: Component, publishedForm?: NavFormType) => {
  if (publishedForm) {
    const publishedComponent = navFormUtils.findByKey(currentComponent.key, publishedForm.components);
    return generateObjectDiff(publishedComponent, currentComponent);
  }
  return null;
};

const getComponentDiff = (currentComponent: Component, publishedForm?: NavFormType) => {
  const changes = checkComponentDiff(currentComponent, publishedForm) || {};
  return createDiffSummary(changes);
};

const createDiffSummary = (changes: any) => {
  const { diff, components } = changes;
  const diffSummary: any = {
    changesToCurrentComponent: [],
    deletedComponents: [],
  };
  if (diff) {
    Object.keys(diff).forEach((key) => {
      diffSummary.changesToCurrentComponent.push({
        key,
        oldValue: diff[key].originalValue,
        newValue: diff[key].value,
      });
    });
  }
  if (components) {
    const allDeleted = components.status === "Slettet";
    if (allDeleted) {
      diffSummary.deletedComponents.push(...components.value);
    } else {
      // @ts-ignore
      diffSummary.deletedComponents.push(
        ...components.filter((c: any) => c.status === "Slettet").map((c: any) => c.originalValue)
      );
    }
  }
  return diffSummary;
};

/**
 * Required both elements to be of same type. Either string, array or object.
 */
const generateFormDiff = (
  originalElement: any,
  newElement: any,
  allowNesting: boolean = false,
  originalIndex?: number
): object | undefined => {
  if (JSON.stringify(originalElement) !== JSON.stringify(newElement) || !isNullOrUndefined(originalIndex)) {
    if (isArray(originalElement) || isArray(newElement)) {
      return generateArrayDiff(originalElement, newElement, allowNesting);
    } else if (isObject(originalElement) || isObject(newElement)) {
      return generateObjectDiff(originalElement, newElement, originalIndex);
    } else {
      return generatePrimitiveDiff(originalElement, newElement);
    }
  }
};

const generatePrimitiveDiff = (originalElement: any, newElement: any) => {
  if (isNullOrUndefined(originalElement)) {
    return {
      status: DiffStatus.NEW,
      value: newElement,
    };
  }

  if (isNullOrUndefined(newElement)) {
    return {
      status: DiffStatus.DELETED,
      value: originalElement,
    };
  }

  return {
    status: DiffStatus.CHANGED,
    originalValue: originalElement,
    value: newElement,
  };
};

const generateObjectDiff = (originalObject: any, newObject: any, originalIndex?: number) => {
  if (isEmptyObject(originalObject)) {
    return {
      status: DiffStatus.NEW,
      value: newObject,
    };
  }

  if (isEmptyObject(newObject)) {
    return {
      status: DiffStatus.DELETED,
      originalValue: originalObject,
    };
  }

  return Object.keys({ ...originalObject, ...newObject }).reduce(
    (acc: any, key) => {
      if (key === "components") {
        return {
          ...acc,
          [key]: generateFormDiff(originalObject[key], newObject[key], true),
        };
      } else {
        const diff = generateFormDiff(originalObject[key], newObject[key]);
        if (diff) {
          return {
            ...acc,
            status: DiffStatus.CHANGED,
            diff: {
              ...acc?.diff,
              [key]: diff,
            },
          };
        } else if (key === "title" || key === "key" || key === "id" || key === "type" || key === "label") {
          return {
            ...acc,
            [key]: newObject[key],
          };
        }
      }

      return acc;
    },
    isNullOrUndefined(originalIndex) ? {} : { originalIndex, status: DiffStatus.CHANGED }
  );
};

const generateArrayDiff = (originalArray: Array<any>, newArray: Array<any>, allowNesting: boolean) => {
  if (isEmptyArray(originalArray) && isEmptyArray(newArray)) {
    return;
  }

  if (isEmptyArray(originalArray)) {
    return {
      status: DiffStatus.NEW,
      value: newArray,
    };
  }

  if (isEmptyArray(newArray)) {
    return {
      status: DiffStatus.DELETED,
      value: originalArray,
    };
  }

  if (allowNesting) {
    const arr = newArray.map((value, newIndex) => {
      const originalIndex = originalArray.findIndex((v) => v.key === value.key);
      if (originalIndex === -1) {
        return generateFormDiff(undefined, value, allowNesting);
      } else {
        return generateFormDiff(
          originalArray[originalIndex],
          value,
          allowNesting,
          newIndex !== originalIndex ? originalIndex : undefined
        );
      }
    });

    originalArray.forEach((value) => {
      const newIndex = newArray.findIndex((v) => v.key === value.key);
      if (newIndex === -1) {
        arr.push(generateFormDiff(value, undefined, allowNesting));
      }
    });

    return arr.filter((value) => value);
  }

  return {
    status: DiffStatus.CHANGED,
    originalValue: originalArray,
    value: newArray,
  };
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

const isObject = (element: any) => {
  // Array is also element in js, but we only want actual objects.
  return typeof element === "object" && !Array.isArray(element);
};

const tools = {
  generateNavFormDiff,
  checkComponentDiff,
  getComponentDiff,
  createDiffSummary,
};

export { generateNavFormDiff, DiffStatus };

export default tools;
