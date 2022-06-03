import signatureUtils from "./signatureUtils";

describe("signatureUtils.ts", () => {
  const oldSingleSignature = {
    signature1: "Doctor",
    signature1Description: "Doctor Description",
  };

  const oldMultipleSignatures = {
    signature1: "Doctor",
    signature1Description: "Doctor Description",
    signature2: "Applicant",
    signature2Description: "Applicant Description",
  };

  const newMultipleSignatures = [
    {
      label: "Doctor",
      description: "Doctor Description",
      key: "1",
    },
    {
      signature2: "Applicant",
      signature2Description: "Applicant Description",
      key: "2",
    },
  ];

  it("returns empty array if empty array is passed", () => {
    expect(signatureUtils.mapBackwardCompatibleSignatures([])).toEqual([]);
  });

  it("return new signature as object array when old formatted single signature is passed", () => {
    const newSignature = signatureUtils.mapBackwardCompatibleSignatures(oldSingleSignature);
    expect(newSignature?.[0].label).toEqual("Doctor");
    expect(newSignature?.[0].description).toEqual("Doctor Description");
  });

  it("return new signatures as object array when old formatted multiple signatures are passed", () => {
    const newSignature = signatureUtils.mapBackwardCompatibleSignatures(oldMultipleSignatures);
    expect(newSignature).toHaveLength(2);
    expect(newSignature?.[0].label).toEqual("Doctor");
    expect(newSignature?.[0].description).toEqual("Doctor Description");
    expect(newSignature?.[1].label).toEqual("Applicant");
    expect(newSignature?.[1].description).toEqual("Applicant Description");
  });

  it("return new signatures when new signatures are passed as params", () => {
    expect(signatureUtils.mapBackwardCompatibleSignatures(newMultipleSignatures)).toEqual(newMultipleSignatures);
  });

  it("returns default signature when undefined is passed as param", () => {
    const newSignature = signatureUtils.mapBackwardCompatibleSignatures(undefined);
    expect(newSignature?.[0].label).toEqual("");
    expect(newSignature?.[0].description).toEqual("");
  });
});
