const sanitizeFileName = (fileName: string) => {
  if (!fileName) {
    return '';
  }

  return fileName
    .replace(/æ/gi, 'ae')
    .replace(/ø/gi, 'oe')
    .replace(/å/gi, 'aa')
    .replace(/[^a-z0-9]/gi, ' ')
    .replace(/(?!^|.$)\s+/g, '-')
    .trim()
    .toLowerCase();
};

export { sanitizeFileName };
