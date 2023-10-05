import { FormSignaturesType, NewFormSignatureType } from "../form";
import { v4 as uuidv4 } from "uuid";

const defaultSignature = [{ label: "", description: "", key: uuidv4() }];

export const hasOnlyDefaultSignaturesValues = (signature?: NewFormSignatureType[] | FormSignaturesType) => {
  if (signature) {
    const mappedSignatures = mapBackwardCompatibleSignatures(signature);
    return (
      mappedSignatures?.length === 1 &&
      mappedSignatures[0].label === defaultSignature[0].label &&
      mappedSignatures[0].description === defaultSignature[0].description
    );
  }
  return true;
};

export const mapBackwardCompatibleSignatures = (
  signatures?: NewFormSignatureType[] | FormSignaturesType,
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
