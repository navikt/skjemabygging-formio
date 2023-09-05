const base64Encode = (data: string | number[]) => {
  return Buffer.from(data).toString("base64");
};

const base64Decode = (data: string) => {
  return Buffer.from(data, "base64");
};

export { base64Encode, base64Decode };
