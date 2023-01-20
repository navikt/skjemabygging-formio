import { Component, FormPropertiesType, NavFormType, NewFormSignatureType } from "../form";
import { navFormUtils } from "../index";

enum DiffStatus {
  NEW = "Ny",
  DELETED = "Slettet",
  CHANGED = "Endring",
}

const generateNavFormDiff = (originalForm: NavFormType, newForm: NavFormType) => {
  return generateFormDiff(originalForm, newForm);
};

function toMap(arrayOfSignatures: NewFormSignatureType[]) {
  return (
    arrayOfSignatures?.reduce?.((acc: any, cur: any) => {
      const { key, label, description } = cur;
      acc[key] = { label, description };
      return acc;
    }, {}) || {}
  );
}

type NewSignature = {
  status: DiffStatus.NEW;
  value: NewFormSignatureType;
};

type ChangedSignature = {
  status: DiffStatus.CHANGED;
  originalValue: NewFormSignatureType;
  value: NewFormSignatureType;
};

type DeletedSignature = {
  status: DiffStatus.DELETED;
  originalValue: NewFormSignatureType;
};
type SignatureDiff = NewSignature | ChangedSignature | DeletedSignature;
type SignaturesDiff = {
  [key: string]: SignatureDiff;
};
const toSignaturesDiff = (arrayDiff: any): SignaturesDiff | undefined => {
  const { originalValue, value } = arrayDiff;
  if (!isArray(originalValue)) {
    return undefined;
  }
  const originalSignatures = toMap(originalValue);
  const currentSignatures = toMap(value);
  const diff: { [key: string]: SignatureDiff } = {};
  Object.keys(originalSignatures).forEach((key: string) => {
    const originalValue = originalSignatures[key] as NewFormSignatureType;
    const newValue = currentSignatures[key];
    if (JSON.stringify(originalValue) !== JSON.stringify(newValue)) {
      diff[key] = {
        status: newValue ? DiffStatus.CHANGED : DiffStatus.DELETED,
        originalValue: originalValue,
        value: newValue,
      };
    }
  });
  Object.keys(currentSignatures).forEach((key: string) => {
    if (!diff[key] && !originalSignatures[key]) {
      diff[key] = {
        status: DiffStatus.NEW,
        value: currentSignatures[key],
      };
    }
  });
  return diff;
};

type NavFormSettingsDiff = {
  [key in keyof FormPropertiesType]?: object;
} & { errorMessage?: string; title?: string };
const generateNavFormSettingsDiff = (
  originalForm: NavFormType | undefined,
  navForm: NavFormType
): NavFormSettingsDiff => {
  try {
    if (!originalForm) {
      return {};
    }
    const propsDiff = generateObjectDiff(originalForm.properties, navForm.properties);
    let signaturesDiff;
    if (propsDiff.diff?.signatures) {
      signaturesDiff = toSignaturesDiff(propsDiff.diff?.signatures);
    }
    return {
      ...(originalForm.title !== navForm.title && {
        title: { ...generatePrimitiveDiff(originalForm.title, navForm.title) },
      }),
      ...(propsDiff.status === DiffStatus.CHANGED && { ...propsDiff.diff }),
      signatures: signaturesDiff,
    };
  } catch (err: any) {
    console.error(`Failed to generate form settings diff: ${err.message}`, err);
    return { errorMessage: "Feil oppstod ved forsøk på å vise endringer siden forrige publisering." };
  }
};

const checkComponentDiff = (currentComponent: Component, publishedForm?: NavFormType) => {
  if (publishedForm) {
    const publishedComponent = navFormUtils.findByNavIdOrKey(currentComponent, publishedForm.components);
    return generateObjectDiff(publishedComponent, currentComponent);
  }
  return null;
};

const getComponentDiff = (currentComponent: Component, publishedForm?: NavFormType) => {
  const changes = checkComponentDiff(currentComponent, publishedForm) || {};
  return createDiffSummary(changes);
};

function toChange(diff: any, key: string) {
  const oldValue = diff.originalValue;
  const newValue = diff.value;
  const change = {
    key,
    oldValue: isObject(oldValue) || isArray(oldValue) ? JSON.stringify(oldValue) : oldValue,
    newValue: isObject(newValue) || isArray(newValue) ? JSON.stringify(newValue) : newValue,
  };
  return change;
}

const createDiffSummary = (changes: any) => {
  const { diff, components } = changes;
  const diffSummary: any = {
    changesToCurrentComponent: [],
    deletedComponents: [],
  };
  if (diff) {
    Object.keys(diff).forEach((key) => {
      const subDiff = diff[key].diff;
      if (subDiff) {
        Object.keys(subDiff).forEach((subKey) => {
          const change = toChange(subDiff[subKey], `${key}.${subKey}`);
          diffSummary.changesToCurrentComponent.push(change);
        });
      } else {
        const change = toChange(diff[key], key);
        diffSummary.changesToCurrentComponent.push(change);
      }
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
      } else if (key !== "id") {
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
      let originalIndex = -1;
      if (value.navId) {
        originalIndex = originalArray.findIndex((v) => v.navId === value.navId);
      }
      if (originalIndex === -1) {
        originalIndex = originalArray.findIndex((v) => v.key === value.key);
      }
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
      let newIndex = -1;
      if (value.navId) {
        newIndex = newArray.findIndex((v) => v.navId === value.navId);
      }
      if (newIndex === -1) {
        newIndex = newArray.findIndex((v) => v.key === value.key);
      }
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
  generateNavFormSettingsDiff,
  checkComponentDiff,
  getComponentDiff,
  createDiffSummary,
  generateObjectDiff,
};

export { generateNavFormDiff, DiffStatus };

export default tools;
