import { v4 as uuidv4 } from "uuid";
import { FormSignaturesType, NewFormSignatureType } from "../form";

const defaultSignature = [{ label: "", description: "", key: uuidv4() }];

export const hasOnlyDefaultSignaturesValues = (signature?: NewFormSignatureType[] | FormSignaturesType) => {
  if (signature) {
    const mappedSignature = mapBackwardCompatibleSignatures(signature);
    if (
      mappedSignature?.length === 1 &&
      mappedSignature[0].label === defaultSignature[0].label &&
      mappedSignature[0].description === defaultSignature[0].description
    ) {
      return true;
    }
    return false;
  }
  return true;
};

export const mapBackwardCompatibleSignatures = (
  signatures?: NewFormSignatureType[] | FormSignaturesType
): NewFormSignatureType[] => {
  if (Array.isArray(signatures)) {
    return signatures;
  }

  if (signatures) {
    const signatureKeys = Object.keys(signatures).filter((key) => /^signature\d$/.test(key) && signatures[key]);
    if (signatureKeys.length > 0) {
      return signatureKeys.map((key) => ({
        label: signatures[key],
        description: signatures[`${key}Description`],
        key: uuidv4(),
      }));
    } else {
      return defaultSignature;
    }
  } else {
    return defaultSignature;
  }
};

const signatureUtils = {
  mapBackwardCompatibleSignatures,
  hasOnlyDefaultSignaturesValues,
};

export default signatureUtils;
