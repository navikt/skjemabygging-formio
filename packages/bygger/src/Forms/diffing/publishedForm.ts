import featureToggles from "../../featureToggles";

async function loadPublishedForm(formPath) {
  if (featureToggles.enableDiff) {
    const response = await fetch(`/api/published-forms/${formPath}`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
      },
    });
    if (response.ok) {
      return await response.json();
    }
  }
  return null;
}

export { loadPublishedForm };
