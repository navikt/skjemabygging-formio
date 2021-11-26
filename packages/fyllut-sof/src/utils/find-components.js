const recourse = (components) => {
  const flat = [];
  components.forEach((component) => {
    if (component.components) {
      recourse(component.components).forEach((sub) => {
        flat.push(sub);
      });
    } else {
      flat.push(component);
    }
  });
  return flat;
};

export const findComponents = (components) => {
  return recourse(components);
};
