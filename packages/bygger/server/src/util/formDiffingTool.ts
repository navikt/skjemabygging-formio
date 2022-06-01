import { NavFormType } from "@navikt/skjemadigitalisering-shared-domain";

enum DiffStatus {
  NEW = "NEW",
  DELETED = "DELETED",
  CHANGED = "CHANGED",
}

const generateNavFormDiff = (originalForm: NavFormType, newForm: NavFormType) => {
  return generateFormDiff(originalForm, newForm);
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
      value1: newObject,
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
    isNullOrUndefined(originalIndex) ? {} : { originalIndex }
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
      const originalIndex = originalArray.findIndex((v) => v.id === value.id);
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
      const newIndex = newArray.findIndex((v) => v.id === value.id);
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

export { generateNavFormDiff, DiffStatus };
