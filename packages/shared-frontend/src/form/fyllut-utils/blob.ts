const b64toBlob = (b64Data: string, contentType = '', sliceSize = 512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays: BlobPart[] = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteArray = new Uint8Array(Array.from(slice, (character) => character.charCodeAt(0)));
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: contentType });
};

const downloadBlob = (content: Blob, fileName: string) => {
  const objectUrl = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;

  try {
    link.click();
  } finally {
    setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  }
};

export { b64toBlob, downloadBlob };
