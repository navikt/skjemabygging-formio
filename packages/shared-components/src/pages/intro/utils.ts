const getStartUrl = (formUrl: string, searchParams: URLSearchParams, defaultPath?: string) => {
  if (searchParams.get('innsendingsId')) {
    return `${formUrl}/oppsummering`;
  }
  if (searchParams.get('sub') === 'digitalnologin') {
    return `${formUrl}/legitimasjon`;
  }
  return `${formUrl}/${defaultPath}`;
};

export { getStartUrl };
