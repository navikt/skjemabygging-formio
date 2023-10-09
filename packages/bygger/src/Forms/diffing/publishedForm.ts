async function loadPublishedForm(formPath) {
  const response = await fetch(`/api/published-forms/${formPath}`, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
    },
  });
  if (response.ok) {
    return await response.json();
  }
  return null;
}

export { loadPublishedForm };
