async function loadPublishedForm(formPath) {
  const response = await fetch(`/api/published-forms/${formPath}`, {
    method: "GET",
    headers: {
      "content-type": "application/json",
    },
  });
  let publishedForm = null;
  if (response.ok) {
    publishedForm = await response.json();
  }
  return publishedForm;
}

export { loadPublishedForm };
