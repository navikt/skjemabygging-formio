export function joinDefaultAndCustomEditForm(defaultEditForm, customEditForm) {
  return [
    ...customEditForm,
    ...defaultEditForm.filter(
      (component) => !customEditForm.find((customComponent) => customComponent.key === component.key)
    ),
  ].filter((component) => !component.ignore);
}
