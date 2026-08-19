const getExitUrl = (url: string) => {
  if (url.includes('.dev.nav.')) {
    return url.includes('ansatt') ? 'https://www.ansatt.dev.nav.no' : 'https://www.intern.dev.nav.no';
  }

  return 'https://www.nav.no';
};

export { getExitUrl };
