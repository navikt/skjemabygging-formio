const beforeUnload = (e) => {
  e.preventDefault();
  e.returnValue = "";
};

const addBeforeUnload = () => {
  window.addEventListener("beforeunload", beforeUnload);
};

const removeBeforeUnload = () => {
  window.removeEventListener("beforeunload", beforeUnload);
};

export { addBeforeUnload, removeBeforeUnload };
