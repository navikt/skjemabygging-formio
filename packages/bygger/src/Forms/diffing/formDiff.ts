async function loadFormDiff(formPath) {
  const response = await fetch(`/api/form/${formPath}/diff`, {
    method: "GET",
    headers: {
      "content-type": "application/json",
    },
  });
  const diff = await response.json();
  console.log("Form diff", diff);
  return diff;
}

export { loadFormDiff };
