const generateId = () => {
  return String(Math.floor(Math.random() * 2147483647));
};

const sanitizeAndLowerCase = (value?: string) => {
  if (!value) return '';

  return value.toLowerCase().replace(/[\s/]/g, '');
};

export { generateId, sanitizeAndLowerCase };
